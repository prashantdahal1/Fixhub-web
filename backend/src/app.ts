import express, { type Application, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { HttpException } from './exceptions/http-exception.js';
import { ApiResponseHelper } from './utils/apihelper.util.js';
import { corsMiddleware } from './middlewares/cors.middleware.js';
import { SESSION_SECRET } from './configs/constant.js';
import { logger } from './utils/logger.js';
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/admin/user.route.js";
import { profileRouter } from './routes/profile.route.js';
import adminRoutes from "./routes/admin.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import session from "express-session";
import passport from "./configs/passport.config.js";
import authRoutes from "./routes/auth.route.js";
import chatbotRouter from "./routes/chatbot.route.js";
import serviceRouter from "./routes/service.route.js";
import bookingRouter from "./routes/booking.route.js";
import walletRouter from "./routes/wallet.route.js";
import reviewRouter from "./routes/review.route.js";
import notificationRouter from "./routes/notification.route.js";

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
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/auth", profileRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/chat", chatbotRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/wallet", walletRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/notifications", notificationRouter);
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