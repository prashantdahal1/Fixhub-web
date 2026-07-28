import { BookingModel } from "../../models/booking.model.js";
import type { IUser } from "../../models/user.model.js";
import type { IService } from "../../models/service.model.js";

export interface PromoResult {
  valid: boolean;
  discount: number;
  message?: string;
  normalizedCode?: string;
}

const formatPromoCode = (code?: string) => (code || "").trim().toUpperCase();

export const getPromoCodes = () => [
  "FIXHUB30",
  "FIRST30",
  "WELCOME30",
  "PROMO500",
  "SAVE500",
  "FIRSTFIX10",
  "GEYSER30",
  "CLEAN500",
];

export async function calculatePromoDiscount(
  promoCode: string | undefined,
  service: IService,
  user: IUser
): Promise<PromoResult> {
  const code = formatPromoCode(promoCode);
  if (!code) {
    return { valid: false, discount: 0, message: "No promo code provided" };
  }

  const servicePrice = Math.max(0, service.basePrice);
  const lower = code;

  if (lower === "FIXHUB30" || lower === "FIRST30" || lower === "WELCOME30") {
    const discount = Math.round(servicePrice * 0.3);
    return { valid: true, discount, normalizedCode: lower };
  }

  if (lower === "PROMO500" || lower === "SAVE500") {
    const discount = 500;
    return { valid: true, discount: Math.min(discount, servicePrice), normalizedCode: lower };
  }

  if (lower === "FIRSTFIX10") {
    if (!user.isVerified) {
      return {
        valid: false,
        discount: 0,
        message: "FIRSTFIX10 requires a verified account.",
      };
    }

    const previousBooking = await BookingModel.exists({ customerId: user._id });
    if (previousBooking) {
      return {
        valid: false,
        discount: 0,
        message: "FIRSTFIX10 is valid only for your first booking.",
      };
    }

    const discount = Math.min(Math.round(servicePrice * 0.1), 500);
    return { valid: true, discount, normalizedCode: lower };
  }

  if (lower === "GEYSER30") {
    if (service.category !== "geyser") {
      return {
        valid: false,
        discount: 0,
        message: "GEYSER30 is valid only for geyser services.",
      };
    }
    if (servicePrice < 1000) {
      return {
        valid: false,
        discount: 0,
        message: "GEYSER30 requires a minimum service amount of Rs 1,000.",
      };
    }
    const discount = Math.round(servicePrice * 0.3);
    return { valid: true, discount, normalizedCode: lower };
  }

  if (lower === "CLEAN500") {
    if (service.category !== "ac_repair") {
      return {
        valid: false,
        discount: 0,
        message: "CLEAN500 is valid only for AC service bookings.",
      };
    }
    const discount = Math.min(500, servicePrice);
    return { valid: true, discount, normalizedCode: lower };
  }

  return { valid: false, discount: 0, message: "Invalid promo code" };
}
