import type { Request, Response } from "express";
import crypto from "crypto";
import { walletService } from "../services/wallet.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import type { TopUpWalletDTO } from "../dtos/marketplace.dto.js";

const ESEWA_TEST_SECRET_KEY = "8gBm/:&EnhH.1/q";
const ESEWA_TEST_PRODUCT_CODE = "INTENT";

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
      const product_code = process.env.ESEWA_PRODUCT_CODE || ESEWA_TEST_PRODUCT_CODE;
      const secret_key = process.env.ESEWA_SECRET_KEY || ESEWA_TEST_SECRET_KEY;
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

      const khaltiKey = process.env.KHALTI_SECRET_KEY;

      let paymentUrl = "";
      let pidx = "";

      if (!khaltiKey) {
        return res.status(400).json({
          message: "KHALTI_SECRET_KEY is required to initiate Khalti payments.",
        });
      }

      try {
        const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
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
          throw new Error(responseData.message || "Failed to initiate payment with Khalti");
        }
      } catch (error: any) {
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

      const secret_key = process.env.ESEWA_SECRET_KEY || ESEWA_TEST_SECRET_KEY;
      const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
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

      const parts = (purchase_order_id as string || responseData.purchase_order_id).split("_");
      const userId = parts[1];
      const amountInRupees = Number(responseData.total_amount) / 100;

      await walletService.verifyAndApplyGatewayTopUp(
        userId,
        amountInRupees,
        "khalti",
        responseData.transaction_id || (transaction_id as string)
      );

      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
    } catch (error) {
      return res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed&reason=error`);
    }
  };
}
