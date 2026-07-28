export type ServiceCategory =
  | "electrician"
  | "plumber"
  | "ac_repair"
  | "painter"
  | "carpenter"
  | "cleaner"
  | "geyser"
  | "appliance_repair"
  | "pest_control"
  | "other";

export interface PromoResult {
  valid: boolean;
  discount: number;
  message: string;
  normalizedCode?: string;
}

export interface PromoUser {
  isVerified?: boolean;
}

export interface PromoService {
  basePrice: number;
  category: ServiceCategory;
}

const formatPromoCode = (code: string | undefined) => (code || "").trim().toUpperCase();

export function evaluatePromoCode(
  code: string | undefined,
  service: PromoService,
  user?: PromoUser | null
): PromoResult {
  const normalizedCode = formatPromoCode(code);
  if (!normalizedCode) {
    return { valid: false, discount: 0, message: "Please enter a promo code." };
  }

  const price = Math.max(0, service.basePrice);

  if (["FIXHUB30", "FIRST30", "WELCOME30"].includes(normalizedCode)) {
    const discount = Math.round(price * 0.3);
    return { valid: true, discount, normalizedCode, message: "30% promo code applied." };
  }

  if (["PROMO500", "SAVE500"].includes(normalizedCode)) {
    const discount = Math.min(500, price);
    return { valid: true, discount, normalizedCode, message: "Rs 500 promo code applied." };
  }

  if (normalizedCode === "FIRSTFIX10") {
    if (!user?.isVerified) {
      return {
        valid: false,
        discount: 0,
        normalizedCode,
        message: "FIRSTFIX10 requires a verified account.",
      };
    }
    return {
      valid: true,
      discount: Math.min(Math.round(price * 0.1), 500),
      normalizedCode,
      message: "10% off first booking applied.",
    };
  }

  if (normalizedCode === "GEYSER30") {
    if (service.category !== "geyser") {
      return {
        valid: false,
        discount: 0,
        normalizedCode,
        message: "GEYSER30 is valid only for geyser services.",
      };
    }
    if (price < 1000) {
      return {
        valid: false,
        discount: 0,
        normalizedCode,
        message: "GEYSER30 requires a minimum service amount of Rs 1,000.",
      };
    }
    return {
      valid: true,
      discount: Math.round(price * 0.3),
      normalizedCode,
      message: "30% off geyser service applied.",
    };
  }

  if (normalizedCode === "CLEAN500") {
    if (service.category !== "ac_repair") {
      return {
        valid: false,
        discount: 0,
        normalizedCode,
        message: "CLEAN500 is valid only for AC service bookings.",
      };
    }
    return {
      valid: true,
      discount: Math.min(500, price),
      normalizedCode,
      message: "Rs 500 clean AC promo applied.",
    };
  }

  return { valid: false, discount: 0, message: "Invalid promo code.", normalizedCode };
}
