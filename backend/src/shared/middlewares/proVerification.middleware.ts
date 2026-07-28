import type { Request, Response, NextFunction } from "express";

export const requireVerifiedPro = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (user.role === "admin") {
        return next();
    }

    if (user.role !== "professional") {
        return res.status(403).json({ success: false, message: "Forbidden: Professional access required" });
    }

    if (!user.isVerified) {
        return res.status(403).json({ success: false, message: "Forbidden: Professional account is not verified yet" });
    }

    next();
};
