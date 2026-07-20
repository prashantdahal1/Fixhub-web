const DEFAULT_BACKEND_URL = "http://localhost:5000";

export const BACKEND_URL = (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");

export function backendApiUrl(path: string) {
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
}