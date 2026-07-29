import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { SECRET_KEY, FRONTEND_URL } from "../../config/constants.js";
import { UserModel } from "../../models/user.model.js";
import { sendPasswordResetEmail } from "../../shared/utils/email.util.js";
import type { IUser } from "../../models/user.model.js";
import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { UserService } from "../user/user.service.js";
import { ApiResponseHelper } from "../../shared/utils/apihelper.util.js";
import { verifyGoogleIdToken } from "../../shared/utils/google.util.js";

const router = Router();
const userService = new UserService();

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many password reset attempts, please try again later." },
});

const resolveGoogleCallbackUrl = (req: Request) => {
    const configured = process.env.GOOGLE_CALLBACK_URL?.trim();
    if (configured) return configured;

    const forwardedProto = req.headers["x-forwarded-proto"]?.toString();
    const protocol = forwardedProto?.split(",")[0]?.trim() || req.protocol || "http";
    const host = req.get("host");
    return `${protocol}://${host}/auth/google/callback`;
};

// /auth/google: Redirect user to Google (always show account picker)
router.get("/google", (req: Request, res: Response, next: NextFunction) => {
    const callbackURL = resolveGoogleCallbackUrl(req);
    passport.authenticate("google", {
        scope: ["openid", "profile", "email"],
        prompt: "select_account",
        accessType: "offline",
        includeGrantedScopes: true,
        callbackURL,
    } as any)(req, res, next);
});

// /auth/google/callback: Callback endpoint for Google
router.get("/google/callback", (req: Request, res: Response, next: NextFunction) => {
    const callbackURL = resolveGoogleCallbackUrl(req);
    passport.authenticate("google", {
        failureRedirect: `${FRONTEND_URL}/login?error=oauth`,
        session: false,
        callbackURL,
    } as any)(req, res, next);
}, (req, res) => {
        // Successful authentication, generate JWT
        const user = req.user as IUser;
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );

        // Set httpOnly token cookie and redirect to frontend with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.redirect(`${FRONTEND_URL}/?token=${token}`);
    }
);

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== "string") {
      return ApiResponseHelper.error(res, "Google ID token is required", 400);
    }

    let payload;
    try {
      payload = await verifyGoogleIdToken(idToken);
    } catch (verifyError: any) {
      console.error("Google verify token failed:", verifyError?.message || verifyError);
      return ApiResponseHelper.error(res, verifyError?.message || "Invalid Google ID token", 401);
    }

    const email = payload.email?.toString();
    const firstName = payload.given_name?.toString() || payload.name?.toString()?.split(" ")[0] || "";
    const lastName = payload.family_name?.toString() || payload.name?.toString()?.split(" ").slice(1).join(" ") || "";
    const profilePicture = payload.picture?.toString() || "";

    if (!email) {
      return ApiResponseHelper.error(res, "Unable to read email from Google token", 400);
    }

    const role = typeof req.body.role === 'string' && req.body.role.trim().toLowerCase() === 'professional'
      ? 'professional'
      : 'customer';

    const { user, token } = await userService.loginOrCreateUserWithGoogle({
      email,
      firstName,
      lastName,
      profilePicture,
      role,
    });

    const safeUser = { ...user.toObject() } as any;
    delete safeUser.password;
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpires;

    return ApiResponseHelper.success(res, { user: safeUser, token }, "Google login successful");
  } catch (error: any) {
    console.error("Google login error:", error);
    return ApiResponseHelper.error(res, error.message || "Google login failed", 500);
  }
});

// POST /auth/forgot-password — Generate token and send reset email
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: "Email is required" });
            return;
        }
        console.info('Forgot password request for:', email);

        const user = await UserModel.findOne({ email });
        // Always respond with success to prevent email enumeration attacks
        if (!user) {
            res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
            return;
        }

        // Generate a cryptographically secure token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        // Store a hashed version of the token
        const hashedResetToken = await bcrypt.hash(resetToken, 10);
        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = expires;
        await user.save();
        // Send the magic link email (plain token)
        await sendPasswordResetEmail(email, resetToken);

        res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
    } catch (error: any) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// POST /auth/reset-password — Validate token and update password
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ success: false, message: "Token and new password are required" });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            return;
        }

        // Find a user with a non‑expired reset token and verify the token
        const candidates = await UserModel.find({
            resetPasswordExpires: { $gt: new Date() },
        });
        let user = null;
        for (const cand of candidates) {
            const match = await bcrypt.compare(token, cand.resetPasswordToken || "");
            if (match) {
                user = cand;
                break;
            }
        }
        if (!user) {
            res.status(400).json({ success: false, message: "Invalid or expired reset token. Please request a new one." });
            return;
        }

        // Hash the new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        delete (user as any).resetPasswordToken;
        delete (user as any).resetPasswordExpires;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error: any) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return ApiResponseHelper.error(res, 'Email and password are required', 400);
    }
    const { user, token } = await userService.loginUser({ email, password });
    return ApiResponseHelper.success(res, { user, token }, 'Login successful');
  } catch (error: any) {
    return ApiResponseHelper.error(res, error.message || 'Login failed', error.status || 500);
  }
});
router.get('/whoami', (req: Request, res: Response) => {
  const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (!token) {
    return ApiResponseHelper.error(res, 'Unauthorized', 401);
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    return userService.getUserById(decoded.id)
      .then((user) => {
        if (!user) return ApiResponseHelper.error(res, 'User not found', 404);
        return ApiResponseHelper.success(res, user, 'User details fetched successfully');
      })
      .catch((err) => ApiResponseHelper.error(res, err.message || 'Internal server error', 500));
  } catch (err) {
    return ApiResponseHelper.error(res, 'Invalid token', 401);
  }
});

export default router;
