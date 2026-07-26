const ESEWA_TEST_SECRET_KEY = "8gBm/:&EnhH.1/q";
const ESEWA_TEST_PRODUCT_CODE = "EPAYTEST";
const KHALTI_SANDBOX_BASE_URL = "https://dev.khalti.com/api/v2";
const KHALTI_PRODUCTION_BASE_URL = "https://khalti.com/api/v2";

export function getEsewaConfig() {
  return {
    productCode: process.env.ESEWA_PRODUCT_CODE || ESEWA_TEST_PRODUCT_CODE,
    secretKey: process.env.ESEWA_SECRET_KEY || ESEWA_TEST_SECRET_KEY,
    paymentUrl:
      process.env.NODE_ENV === "production"
        ? "https://epay.esewa.com.np/api/epay/main/v2/form"
        : "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  };
}

export function isKhaltiLocalMockEnabled() {
  return !process.env.KHALTI_SECRET_KEY && process.env.NODE_ENV !== "production";
}

export function getKhaltiConfig() {
  const sandbox = process.env.KHALTI_SANDBOX === "true" || process.env.NODE_ENV !== "production";
  const baseUrl = (process.env.KHALTI_BASE_URL || (sandbox ? KHALTI_SANDBOX_BASE_URL : KHALTI_PRODUCTION_BASE_URL)).replace(/\/$/, "");
  const secretKey = (process.env.KHALTI_SECRET_KEY || "").trim();

  return {
    secretKey,
    baseUrl,
    initiateUrl: `${baseUrl}/epayment/initiate/`,
    lookupUrl: `${baseUrl}/epayment/lookup/`,
  };
}
