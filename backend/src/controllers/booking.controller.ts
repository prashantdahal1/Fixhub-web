import type { Request, Response } from "express";
import crypto from "crypto";
import { bookingService } from "../services/booking.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import type { UpdateBookingStatusDTO } from "../dtos/marketplace.dto.js";
import { BookingModel } from "../models/booking.model.js";
import { TransactionModel } from "../models/transaction.model.js";
import { PaymentIntentModel } from "../models/payment-intent.model.js";
import { ServiceModel } from "../models/service.model.js";
import { HttpException } from "../exceptions/http-exception.js";
import { createNotification } from "../utils/notification.util.js";
import { broadcastRealtimeEvent } from "../utils/realtime.util.js";
import { getEsewaConfig, getKhaltiConfig, isKhaltiLocalMockEnabled } from "../utils/payment-gateway.util.js";

export class BookingController {
  /**
   * STEP 1 — Initiate payment.
   * Creates a PaymentIntent (temporary, auto-expires in 2 hrs) and redirects
   * the user to the payment gateway. NO booking is created here.
   */
  create = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { serviceId, scheduledAt, address, notes, paymentProvider } = req.body as {
      serviceId: string;
      scheduledAt: string;
      address: string;
      notes?: string;
      paymentProvider: "esewa" | "khalti" | "cod";
    };

    if (user.role !== "customer" && user.role !== "admin") {
      throw new HttpException(403, "Only customers can create bookings");
    }

    const service = await ServiceModel.findById(serviceId);
    if (!service || !service.isActive) {
      throw new HttpException(404, "Service not found or inactive");
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate.getTime() < Date.now() - 60_000) {
      throw new HttpException(400, "scheduledAt must be in the future");
    }

    const amount = service.basePrice;
    const backendUrl = `${req.protocol}://${req.get("host")}`;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Save booking intent — no booking in DB yet
    const intent = await PaymentIntentModel.create({
      customerId: user._id,
      serviceId: service._id,
      scheduledAt: scheduledDate,
      address: address.trim(),
      notes: notes?.trim() || "",
      amount,
      provider: paymentProvider,
    });
    const intentId = intent._id.toString();

    // ── eSewa ──────────────────────────────────────────────────────────────
    if (paymentProvider === "esewa") {
      const transaction_uuid = `esewa_${intentId}_${Date.now()}`;
      const { productCode: product_code, secretKey: secret_key, paymentUrl } = getEsewaConfig();
      const total_amount = amount.toFixed(2);

      const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const signature = crypto
        .createHmac("sha256", secret_key)
        .update(signatureString)
        .digest("base64");

      return ApiResponseHelper.success(res, {
        payment: {
          provider: "esewa",
          paymentUrl,
          formData: {
            amount: total_amount,
            tax_amount: "0",
            total_amount: total_amount,
            transaction_uuid,
            product_code,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${backendUrl}/api/v1/bookings/verify/esewa`,
            failure_url: `${backendUrl}/api/v1/bookings/cancel/esewa?intent_id=${intentId}`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature,
          },
        },
      }, "Payment initiated. Complete payment to confirm booking.", 201);
    }

    // ── Cash on Delivery (COD) ─────────────────────────────────────────────
    if (paymentProvider === "cod") {
      if (!service.professionalId) {
        throw new HttpException(400, "This service does not have an assigned professional.");
      }

      await PaymentIntentModel.findByIdAndDelete(intentId); // intent not needed for COD

      // COD costs an extra 10 NPR
      const codAmount = amount + 10;

      // Create booking directly
      const booking = await BookingModel.create({
        customerId: user._id,
        professionalId: service.professionalId,
        serviceId: service._id,
        scheduledAt: scheduledDate,
        address: address.trim(),
        notes: notes?.trim() || "",
        amount: codAmount,
        status: "confirmed",
        escrowStatus: "none",
      });

      // Send notifications
      const serviceTitle = service?.title || "Service";
      await createNotification(
        user._id,
        "Booking Confirmed",
        `Your COD appointment for "${serviceTitle}" on ${scheduledDate.toLocaleDateString()} is confirmed.`,
        "confirm"
      );
      await createNotification(
        service.professionalId,
        "New Booking Assigned",
        `You have a new COD booking request for "${serviceTitle}" scheduled at ${scheduledDate.toLocaleDateString()}.`,
        "booking"
      );

      broadcastRealtimeEvent("booking_created", {
        id: booking._id.toString(),
        customerId: booking.customerId.toString(),
        professionalId: booking.professionalId.toString(),
        serviceId: booking.serviceId.toString(),
        status: booking.status,
        scheduledAt: booking.scheduledAt.toISOString(),
      });

      return ApiResponseHelper.success(res, {
        payment: {
          provider: "cod",
          redirectUrl: `${frontendUrl}/dashboard/bookings?payment=success&method=cod`,
        },
      }, "Booking confirmed successfully with Cash on Delivery.", 201);
    }

    // ── Khalti ─────────────────────────────────────────────────────────────
    if (paymentProvider === "khalti") {
      const purchase_order_id = `khalti_${intentId}_${Date.now()}`;

      if (isKhaltiLocalMockEnabled()) {
        const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${encodeURIComponent(intentId)}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
        return ApiResponseHelper.success(res, {
          payment: { provider: "khalti", paymentUrl: sandboxPaymentUrl },
        }, "Khalti sandbox payment initiated. Complete the sandbox flow to confirm booking.", 201);
      }

      const { secretKey: khaltiKey, initiateUrl } = getKhaltiConfig();
      if (!khaltiKey) {
        if (process.env.NODE_ENV !== "production") {
          const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${encodeURIComponent(intentId)}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
          return ApiResponseHelper.success(res, {
            payment: { provider: "khalti", paymentUrl: sandboxPaymentUrl },
          }, "Khalti sandbox payment initiated. Complete the sandbox flow to confirm booking.", 201);
        }
        return res.status(400).json({
          message: "KHALTI_SECRET_KEY is required to initiate Khalti payments.",
        });
      }

      try {
        const response = await fetch(initiateUrl, {
          method: "POST",
          headers: {
            "Authorization": `Key ${khaltiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: `${backendUrl}/api/v1/bookings/verify/khalti`,
            website_url: frontendUrl,
            amount: Math.round(amount * 100), // paisa
            purchase_order_id,
            purchase_order_name: `Fixhub Service Booking`,
            customer_info: {
              name: user.name || "Fixhub User",
              email: user.email || "user@fixhub.com",
              phone: user.phone || "9800000000",
            },
          }),
        });

        const khaltiData = await response.json() as any;
        if (!response.ok || !khaltiData.payment_url) {
          if (process.env.NODE_ENV !== "production") {
            const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${encodeURIComponent(intentId)}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
            return ApiResponseHelper.success(res, {
              payment: { provider: "khalti", paymentUrl: sandboxPaymentUrl },
            }, "Khalti sandbox payment initiated. Complete the sandbox flow to confirm booking.", 201);
          }
          await PaymentIntentModel.findByIdAndDelete(intentId);
          return res.status(400).json({
            message: khaltiData?.detail || khaltiData?.message || "Failed to initiate Khalti payment. Please try again.",
            details: khaltiData,
          });
        }

        return ApiResponseHelper.success(res, {
          payment: { provider: "khalti", paymentUrl: khaltiData.payment_url },
        }, "Khalti payment initiated. Complete payment to confirm booking.", 201);
      } catch (err: any) {
        if (process.env.NODE_ENV !== "production") {
          const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${encodeURIComponent(intentId)}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
          return ApiResponseHelper.success(res, {
            payment: { provider: "khalti", paymentUrl: sandboxPaymentUrl },
          }, "Khalti sandbox payment initiated. Complete the sandbox flow to confirm booking.", 201);
        }
        await PaymentIntentModel.findByIdAndDelete(intentId);
        return res.status(400).json({
          message: err.message || "Failed to initiate Khalti payment.",
        });
      }
    }

    throw new HttpException(400, "Invalid payment provider");
  };

  listMine = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const bookings = await bookingService.getMyBookings(user);
    return ApiResponseHelper.success(res, bookings, "Bookings fetched successfully");
  };

  getOne = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const booking = await bookingService.getBookingById(req.params.id as string, user);
    return ApiResponseHelper.success(res, booking, "Booking fetched successfully");
  };

  updateStatus = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { action } = req.body as UpdateBookingStatusDTO;
    const booking = await bookingService.updateStatus(req.params.id as string, action, user);
    return ApiResponseHelper.success(res, booking, `Booking ${action}ed successfully`);
  };

  /**
   * STEP 2a — eSewa success callback.
   * Payment is confirmed → NOW create the booking with escrow held.
   */
  verifyEsewa = async (req: Request, res: Response) => {
    const { data } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!data) {
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=no_data`);
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(data as string, "base64").toString("utf-8")
      );

      const { transaction_code, status, total_amount, transaction_uuid, product_code, signature } = decoded;

      if (status !== "COMPLETE") {
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=not_complete`);
      }

      // Verify signature
      const { secretKey: secret_key } = getEsewaConfig();
      const signatureString = (decoded.signed_field_names as string)
        .split(",")
        .map((field) => `${field}=${decoded[field] || ""}`)
        .join(",");
      const expectedSignature = crypto.createHmac("sha256", secret_key).update(signatureString).digest("base64");

      if (signature !== expectedSignature) {
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=signature_mismatch`);
      }

      // Extract intent ID from transaction_uuid: "esewa_<intentId>_<timestamp>"
      const parts = (transaction_uuid as string).split("_");
      const intentId = parts[1];

      const intent = await PaymentIntentModel.findById(intentId);
      if (!intent) {
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=intent_expired`);
      }

      // Idempotency — don't double-create if callback fires twice
      const existingTx = await TransactionModel.findOne({ gatewayTransactionId: transaction_code });
      if (existingTx) {
        await PaymentIntentModel.findByIdAndDelete(intentId);
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
      }

      // Create the booking NOW that payment is confirmed
      const service = await ServiceModel.findById(intent.serviceId);
      if (!service || !service.professionalId) {
        throw new Error("Service or professional not found");
      }
      const booking = (await BookingModel.create({
        customerId: intent.customerId,
        professionalId: service.professionalId,
        serviceId: intent.serviceId,
        scheduledAt: intent.scheduledAt,
        address: intent.address,
        notes: intent.notes,
        amount: intent.amount,
        status: "confirmed",
        escrowStatus: "held",
      } as any)) as any;

      await TransactionModel.create({
        userId: intent.customerId,
        type: "hold",
        amount: intent.amount,
        bookingId: booking._id,
        gateway: "esewa",
        gatewayTransactionId: transaction_code,
        note: `eSewa payment confirmed. Booking ${booking._id} created with escrow held.`,
      });

      // Send notifications
      const serviceTitle = service?.title || "Service";
      await createNotification(
        intent.customerId,
        "Booking Confirmed",
        `Your appointment for "${serviceTitle}" on ${new Date(intent.scheduledAt).toLocaleDateString()} is confirmed.`,
        "confirm"
      );
      if (service?.professionalId) {
        await createNotification(
          service.professionalId,
          "New Booking Assigned",
          `You have a new booking request for "${serviceTitle}" scheduled at ${new Date(intent.scheduledAt).toLocaleDateString()}.`,
          "booking"
        );
      }

      // Clean up the intent — it's been used
      await PaymentIntentModel.findByIdAndDelete(intentId);

      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
    } catch (error) {
      console.error("[verifyEsewa] error:", error);
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=error`);
    }
  };

  /**
   * STEP 2b — Khalti success callback.
   * Payment is confirmed → NOW create the booking with escrow held.
   */
  verifyKhalti = async (req: Request, res: Response) => {
    const { pidx, transaction_id, amount, purchase_order_id, status } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!pidx || status === "User canceled") {
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=cancelled`);
    }

    try {
      let gatewayTxId: string;
      let orderId: string;

      if (typeof pidx === "string" && pidx.startsWith("mock_khalti_")) {
        gatewayTxId = (transaction_id as string) || `mock_tx_${Date.now()}`;
        orderId = purchase_order_id as string;
      } else {
        const { secretKey: khaltiKey, lookupUrl } = getKhaltiConfig();
        if (!khaltiKey) {
          return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=missing_khalti_secret`);
        }

        const response = await fetch(lookupUrl, {
          method: "POST",
          headers: {
            "Authorization": `Key ${khaltiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pidx }),
        });

        const responseData = await response.json() as any;
        if (!response.ok || responseData.status !== "Completed") {
          return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=lookup_failed`);
        }

        gatewayTxId = responseData.transaction_id || (transaction_id as string);
        orderId = responseData.purchase_order_id || (purchase_order_id as string);
      }

      // Extract intent ID from purchase_order_id: "khalti_<intentId>_<timestamp>"
      const parts = (orderId || "").split("_");
      const intentId = parts[1];

      const intent = await PaymentIntentModel.findById(intentId);
      if (!intent) {
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=intent_expired`);
      }

      // Idempotency — don't double-create if callback fires twice
      const existingTx = await TransactionModel.findOne({ gatewayTransactionId: gatewayTxId });
      if (existingTx) {
        await PaymentIntentModel.findByIdAndDelete(intentId);
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
      }

      // Create the booking NOW that payment is confirmed
      const service = await ServiceModel.findById(intent.serviceId);
      if (!service || !service.professionalId) {
        throw new Error("Service or professional not found");
      }
      const booking = (await BookingModel.create({
        customerId: intent.customerId,
        professionalId: service.professionalId,
        serviceId: intent.serviceId,
        scheduledAt: intent.scheduledAt,
        address: intent.address,
        notes: intent.notes,
        amount: intent.amount,
        status: "confirmed",
        escrowStatus: "held",
      } as any)) as any;

      await TransactionModel.create({
        userId: intent.customerId,
        type: "hold",
        amount: intent.amount,
        bookingId: booking._id,
        gateway: "khalti",
        gatewayTransactionId: gatewayTxId,
        note: `Khalti payment confirmed. Booking ${booking._id} created with escrow held.`,
      });

      // Send notifications
      const serviceTitle = service?.title || "Service";
      await createNotification(
        intent.customerId,
        "Booking Confirmed",
        `Your appointment for "${serviceTitle}" on ${new Date(intent.scheduledAt).toLocaleDateString()} is confirmed.`,
        "confirm"
      );
      if (service?.professionalId) {
        await createNotification(
          service.professionalId,
          "New Booking Assigned",
          `You have a new booking request for "${serviceTitle}" scheduled at ${new Date(intent.scheduledAt).toLocaleDateString()}.`,
          "booking"
        );
      }

      // Clean up the intent — it's been used
      await PaymentIntentModel.findByIdAndDelete(intentId);

      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
    } catch (error) {
      console.error("[verifyKhalti] error:", error);
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=error`);
    }
  };

  /**
   * eSewa failure/cancel callback.
   * Delete the PaymentIntent — no booking was ever created, nothing to clean up.
   */
  cancelEsewa = async (req: Request, res: Response) => {
    const { intent_id } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (intent_id) {
      await PaymentIntentModel.findByIdAndDelete(intent_id as string).catch(() => {});
    }

    return res.redirect(`${frontendUrl}/dashboard/bookings?payment=cancelled`);
  };
}
