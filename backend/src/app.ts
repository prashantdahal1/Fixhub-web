import express, { type Application, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { HttpException } from './shared/exceptions/http-exception.js';
import { ApiResponseHelper } from './shared/utils/apihelper.util.js';
import { corsMiddleware } from './shared/middlewares/cors.middleware.js';
import { SESSION_SECRET } from './config/constants.js';
import { logger } from './shared/utils/logger.js';
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./modules/user/user.route.js";
import { profileRouter } from './modules/admin/profile.route.js';
import adminRoutes from "./modules/admin/admin.route.js";
import ticketRoutes from "./modules/ticket/ticket.route.js";
import ticketDeletionRoutes from './modules/ticket/ticket-deletion.route.js';
import session from "express-session";
import passport from "./config/passport.config.js";
import authRoutes from "./modules/auth/auth.route.js";
import chatbotRouter from "./modules/chat/chatbot.route.js";
import serviceRouter from "./modules/service/service.route.js";
import bookingRouter from "./modules/booking/booking.route.js";
import walletRouter from "./modules/wallet/wallet.route.js";
import reviewRouter from "./modules/review/review.route.js";
import notificationRouter from "./modules/notification/notification.route.js";
import messageRouter from "./modules/chat/message.route.js";
import thingRouter from "./modules/thing/thing.route.js";
import aiMatchingRouter from "./modules/ai-matching/ai-matching.route.js";

const app: Application = express();
app.use(corsMiddleware);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use(morgan("combined"));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/auth", profileRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use('/api/v1/ticket-deletions', ticketDeletionRoutes);
app.use("/api/v1/chat", chatbotRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/wallet", walletRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/things", thingRouter);
app.use("/api/v1/ai-matching", aiMatchingRouter);
app.use("/auth", authRoutes);

app.use(
    (req: Request, res: Response) => {
        return ApiResponseHelper.error(res, "API not found", 404);
    }
)

app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(err);
        if (err instanceof HttpException) {
            return ApiResponseHelper.error(
                res, err.message, err.status
            );
        }
        return ApiResponseHelper.error(
            res, err?.message || "Internal Server Error", 500
        );
    }
)

export default app;