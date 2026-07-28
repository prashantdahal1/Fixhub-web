import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || "").toString().trim();
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google ID token payload");
  }
  return payload;
}
