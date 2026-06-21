import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import { corsMiddleware } from "./middlewares/cors.middleware";
import morgan from "morgan";
import path from "path";

import userRoutes from "./routes/user.route";
import { profileRouter } from "./routes/profile.route";

const app: Application = express();
app.use(corsMiddleware);

app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));
app.use(morgan("combined"));

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/auth", profileRouter);

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