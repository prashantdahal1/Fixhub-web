import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { SECRET_KEY } from "../configs/constant.js";
import { UserModel } from "../models/user.model.js";
import { sendPasswordResetEmail } from "../utils/email.util.js";
import type { IUser } from "../models/user.model.js";

const router = Router();

// /auth/google: Redirect user to Google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
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
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: "Email is required" });
            return;
        }

        const user = await UserModel.findOne({ email });
        // Always respond with success to prevent email enumeration attacks
        if (!user) {
            res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
            return;
        }

        // Generate a cryptographically secure token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save token + expiry to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = expires;
        await user.save();

        // Send the magic link email
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
        if (newPassword.length < 6) {
            res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
            return;
        }

        // Find user with matching, non-expired token
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }, // Must not be expired
        });

        if (!user) {
            res.status(400).json({ success: false, message: "Invalid or expired reset token. Please request a new one." });
            return;
        }

        // Hash the new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error: any) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


export default router;
