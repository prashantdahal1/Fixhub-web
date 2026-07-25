import type { Request, Response } from "express";
import crypto from "crypto";
import { walletService } from "../services/wallet.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import type { TopUpWalletDTO } from "../dtos/marketplace.dto.js";
import { getEsewaConfig, getKhaltiConfig, isKhaltiLocalMockEnabled } from "../utils/payment-gateway.util.js";

export class WalletController {
  getMine = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const data = await walletService.getWallet(user._id.toString());
    return ApiResponseHelper.success(res, data, "Wallet fetched successfully");
  };

  topUp = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { amount } = req.body as TopUpWalletDTO;
    const wallet = await walletService.topUp(user._id.toString(), amount);
    return ApiResponseHelper.success(res, wallet, "Wallet topped up successfully");
  };

  initiatePayment = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { amount, provider } = req.body as { amount: number; provider: "esewa" | "khalti" };

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (provider === "esewa") {
      const transaction_uuid = `esewa_${user._id.toString()}_${Date.now()}`;
      const { productCode: product_code, secretKey: secret_key, paymentUrl } = getEsewaConfig();
      const total_amount = amount.toFixed(2);

      const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const signature = crypto
        .createHmac("sha256", secret_key)
        .update(signatureString)
        .digest("base64");

      const backendUrl = `${req.protocol}://${req.get("host")}`;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      return ApiResponseHelper.success(res, {
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
          success_url: `${backendUrl}/api/v1/wallet/verify/esewa`,
          failure_url: `${frontendUrl}/dashboard/bookings?payment=failed`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature,
        },
      }, "eSewa payment initiated successfully");
    } else if (provider === "khalti") {
      const purchase_order_id = `khalti_${user._id.toString()}_${Date.now()}`;
      const backendUrl = `${req.protocol}://${req.get("host")}`;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      const { secretKey: khaltiKey, initiateUrl } = getKhaltiConfig();

      let paymentUrl = "";
      let pidx = "";

      if (isKhaltiLocalMockEnabled() || (!khaltiKey && process.env.NODE_ENV !== "production")) {
        const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${user._id.toString()}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
        return ApiResponseHelper.success(res, {
          provider: "khalti",
          paymentUrl: sandboxPaymentUrl,
          pidx: `mock_khalti_${user._id.toString()}_${Date.now()}`,
        }, "Khalti sandbox payment initiated successfully");
      }

      if (!khaltiKey) {
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
            return_url: `${backendUrl}/api/v1/wallet/verify/khalti`,
            website_url: frontendUrl,
            amount: Math.round(amount * 100), // Khalti expects paisa
            purchase_order_id,
            purchase_order_name: "Fixhub Wallet Top Up",
            customer_info: {
              name: user.name || "Fixhub User",
              email: user.email || "user@fixhub.com",
              phone: user.phone || "9800000000",
            },
          }),
        });

        const responseData = await response.json() as any;

        if (response.ok && responseData.payment_url) {
          paymentUrl = responseData.payment_url;
          pidx = responseData.pidx;
        } else {
          if (process.env.NODE_ENV !== "production") {
            const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${user._id.toString()}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
            return ApiResponseHelper.success(res, {
              provider: "khalti",
              paymentUrl: sandboxPaymentUrl,
              pidx: `mock_khalti_${user._id.toString()}_${Date.now()}`,
            }, "Khalti sandbox payment initiated (fallback)");
          }
          throw new Error(responseData.message || "Failed to initiate payment with Khalti");
        }
      } catch (error: any) {
        if (process.env.NODE_ENV !== "production") {
          const sandboxPaymentUrl = `${frontendUrl}/payments/khalti-sandbox?intentId=${user._id.toString()}&purchaseOrderId=${encodeURIComponent(purchase_order_id)}&amount=${Math.round(amount * 100)}`;
          return ApiResponseHelper.success(res, {
            provider: "khalti",
            paymentUrl: sandboxPaymentUrl,
            pidx: `mock_khalti_${user._id.toString()}_${Date.now()}`,
          }, "Khalti sandbox payment initiated (fallback)");
        }
        return res.status(400).json({
          message: "Failed to initiate payment with Khalti",
          details: error.message,
        });
      }

      return ApiResponseHelper.success(res, {
        provider: "khalti",
        paymentUrl,
        pidx,
      }, "Khalti payment initiated successfully");
    } else {
      return res.status(400).json({ message: "Unsupported payment provider" });
    }
  };

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

      const {
        transaction_code,
        status,
        total_amount,
        transaction_uuid,
        product_code,
        signature,
      } = decoded;

      if (status !== "COMPLETE") {
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=not_complete`);
      }

      const { secretKey: secret_key } = getEsewaConfig();
      const signatureString = (decoded.signed_field_names as string)
        .split(",")
        .map((field) => `${field}=${decoded[field] || ""}`)
        .join(",");
      const expectedSignature = crypto
        .createHmac("sha256", secret_key)
        .update(signatureString)
        .digest("base64");

      if (signature !== expectedSignature) {
        return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=signature_mismatch`);
      }

      const parts = transaction_uuid.split("_");
      const userId = parts[1];

      await walletService.verifyAndApplyGatewayTopUp(
        userId,
        Number(total_amount),
        "esewa",
        transaction_code
      );

      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
    } catch (error) {
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=error`);
    }
  };

  verifyKhalti = async (req: Request, res: Response) => {
    const { pidx, transaction_id, amount, purchase_order_id, status } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!pidx || status === "User canceled") {
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=cancelled`);
    }

    try {
      let gatewayTxId: string;
      let userId: string;
      let amountInRupees: number;

      if (typeof pidx === "string" && pidx.startsWith("mock_khalti_")) {
        gatewayTxId = (transaction_id as string) || `mock_tx_${Date.now()}`;
        const parts = (purchase_order_id as string || "").split("_");
        userId = parts[1] || "";
        amountInRupees = Number(amount || 0) / 100;
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

        const parts = (purchase_order_id as string || responseData.purchase_order_id).split("_");
        userId = parts[1];
        amountInRupees = Number(responseData.total_amount) / 100;
        gatewayTxId = responseData.transaction_id || (transaction_id as string);
      }

      await walletService.verifyAndApplyGatewayTopUp(
        userId,
        amountInRupees,
        "khalti",
        gatewayTxId
      );

      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
    } catch (error) {
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=error`);
    }
  };
}
