import { UserService } from '../services/user.service.js';
import { ZodError } from 'zod';
import { CreateUserDTO, LoginUserDTO } from '../dtos/user.dto.js';
import { ApiResponseHelper } from '../utils/apihelper.util.js';
import { type Request, type Response } from 'express';

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

    async whoami(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const user = await userService.getUserById(userId);
            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, user, "User details fetched successfully");
        } catch (error: any) {
            console.error("Whoami Error:", error);
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const updateData = { ...req.body };
            if (req.file) {
                updateData.profilePicture = `/uploads/profile_pics/${req.file.filename}`;
            }
            const updatedUser = await userService.updateUser(userId, updateData);
            return ApiResponseHelper.success(res, updatedUser, "Profile updated successfully");
        } catch (error: any) {
            console.error("Update Profile Error:", error);
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}