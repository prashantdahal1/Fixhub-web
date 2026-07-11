import express, { type Application, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { HttpException } from './exceptions/http-exception.js';
import { ApiResponseHelper } from './utils/apihelper.util.js';
import { corsMiddleware } from './middlewares/cors.middleware.js';
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/admin/user.route.js";
import { profileRouter } from './routes/profile.route.js';
import adminRoutes from "./routes/admin.route.js";
import ticketRoutes from "./routes/ticket.routes.js";

const app: Application = express();
app.use(corsMiddleware);

app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use(morgan("combined"));

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/auth", profileRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/tickets", ticketRoutes);

app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "API not found" });
    }
)

app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);
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