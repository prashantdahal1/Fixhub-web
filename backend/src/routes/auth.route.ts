import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { SECRET_KEY } from "../configs/constant.js";
import { UserModel } from "../models/user.model.js";
import { sendPasswordResetEmail } from "../utils/email.util.js";
import type { IUser } from "../models/user.model.js";
import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";

const router = Router();
const userService = new UserService();

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many password reset attempts, please try again later." },
});

// /auth/google: Redirect user to Google (always show account picker)
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
    })
);

// /auth/google/callback: Callback endpoint for Google
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        // Successful authentication, generate JWT
        const user = req.user as IUser;
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );

        // Redirect to frontend with token (adjust the URL to your frontend's URL)
        // E.g., http://localhost:3000/auth/success?token=...
        res.redirect(`http://localhost:3000/?token=${token}`);
    }
);

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
export default router;
