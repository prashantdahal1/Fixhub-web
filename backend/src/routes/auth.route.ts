import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant.js";
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

export default router;
