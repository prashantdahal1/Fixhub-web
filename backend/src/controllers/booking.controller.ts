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

const ESEWA_TEST_SECRET_KEY = "8gBm/:&EnhH.1/q";
const ESEWA_TEST_PRODUCT_CODE = "INTENT";

function isKhaltiSandboxEnabled() {
  return process.env.KHALTI_SANDBOX === "true" || (!process.env.KHALTI_SECRET_KEY && process.env.NODE_ENV !== "production");
}

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
      paymentProvider: "esewa" | "khalti";
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
      const product_code = process.env.ESEWA_PRODUCT_CODE || ESEWA_TEST_PRODUCT_CODE;
      const secret_key = process.env.ESEWA_SECRET_KEY || ESEWA_TEST_SECRET_KEY;
      const total_amount = amount.toFixed(2);

      const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const signature = crypto
        .createHmac("sha256", secret_key)
        .update(signatureString)
        .digest("base64");

      return ApiResponseHelper.success(res, {
        payment: {
          provider: "esewa",
          paymentUrl: process.env.NODE_ENV === "production"
            ? "https://epay.esewa.com.np/api/epay/main/v2/form"
            : "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
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

    // ── Khalti ─────────────────────────────────────────────────────────────
    if (paymentProvider === "khalti") {
      const purchase_order_id = `khalti_${intentId}_${Date.now()}`;
      const khaltiSandbox = isKhaltiSandboxEnabled();

      if (khaltiSandbox) {
        const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${encodeURIComponent(intentId)}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
        return ApiResponseHelper.success(res, {
          payment: { provider: "khalti", paymentUrl: sandboxPaymentUrl },
        }, "Khalti sandbox payment initiated. Complete the sandbox flow to confirm booking.", 201);
      }

      const khaltiKey = process.env.KHALTI_SECRET_KEY;
      if (!khaltiKey) {
        return res.status(400).json({
          message: "KHALTI_SECRET_KEY is required to initiate Khalti payments.",
        });
      }

      // Live Khalti API
      const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
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
        // Delete the intent since payment failed to initiate
        await PaymentIntentModel.findByIdAndDelete(intentId);
        return res.status(400).json({
          message: "Failed to initiate Khalti payment. Please try again.",
          details: khaltiData,
        });
      }

      return ApiResponseHelper.success(res, {
        payment: { provider: "khalti", paymentUrl: khaltiData.payment_url },
      }, "Khalti payment initiated. Complete payment to confirm booking.", 201);
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
      const secret_key = process.env.ESEWA_SECRET_KEY || ESEWA_TEST_SECRET_KEY;
      const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
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
      const khaltiSandbox = isKhaltiSandboxEnabled();
      let gatewayTxId: string;
      let orderId: string;

      if (khaltiSandbox && typeof pidx === "string" && pidx.startsWith("mock_khalti_")) {
        gatewayTxId = (transaction_id as string) || `mock_tx_${Date.now()}`;
        orderId = purchase_order_id as string;
      } else {
        const khaltiKey = process.env.KHALTI_SECRET_KEY;
        if (!khaltiKey) {
          return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=missing_khalti_secret`);
        }

        const response = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
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
