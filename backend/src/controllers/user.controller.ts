import { UserService } from "../services/user.service";
import { ZodError } from "zod";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";

function formatZodError(error: ZodError): string {
  return error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
}

const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                console.error("Zod Validation Failed:", JSON.stringify(userData.error.errors, null, 2));
                return ApiResponseHelper.error(res, formatZodError(userData.error), 400);
            }
            const user = await userService.createUser(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: any) {
            console.error("User Creation Error:", error);
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
    
    async loginUser(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                console.error("Login Zod Validation Failed:", JSON.stringify(parsedData.error.errors, null, 2));
                return ApiResponseHelper.error(res, formatZodError(parsedData.error), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: false });
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        } catch (error: any) {
            console.error("Login Error:", error);
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}