import { UserService } from '../services/user.service.js';
import { ZodError } from 'zod';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, UpdatePasswordDTO, AdminUpdateUserDTO, AdminCreateUserDTO } from '../dtos/user.dto.js';
import { ApiResponseHelper } from '../utils/apihelper.util.js';
import { type Request, type Response } from 'express';

import { UserMongoRepository } from '../repositories/user.repository.js';

function formatZodError(error: ZodError): string {
  return error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
}

const userService = new UserService();
const userRepository = new UserMongoRepository();

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
            const cookieOptions: any = { httpOnly: true, sameSite: 'strict', secure: false };
            if (parsedData.data.stayLoggedIn) {
                cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            }
            res.cookie('token', token, cookieOptions);
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
            const userId = (req as any).user?._id || (req as any).user?.id;
            if (!userId) {
                return ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const user = await userService.getUserById(userId.toString());
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
            const userId = (req as any).user?._id || (req as any).user?.id;
            if (!userId) {
                return ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            
            const parsedData = UpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, formatZodError(parsedData.error), 400);
            }

            const updateData = { ...parsedData.data } as any;
            if (req.file) {
                updateData.profilePicture = `/uploads/profile_pics/${req.file.filename}`;
            }

            const updatedUser = await userService.updateUser(userId.toString(), updateData);
            return ApiResponseHelper.success(res, updatedUser, "Profile updated successfully");
        } catch (error: any) {
            console.error("Update Profile Error:", error);
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user?._id || (req as any).user?.id;
            if (!userId) {
                return ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            
            const parsedData = UpdatePasswordDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, formatZodError(parsedData.error), 400);
            }

            await userService.updatePassword(userId.toString(), parsedData.data);
            return ApiResponseHelper.success(res, null, "Password updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            if (!id) {
                return ApiResponseHelper.error(res, "User ID is required", 400);
            }
            const parsedData = AdminUpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, formatZodError(parsedData.error), 400);
            }
            
            const updateData = { ...parsedData.data } as any;
            if (req.file) {
                updateData.profilePicture = `/uploads/profile_pics/${req.file.filename}`;
            }

            const existingUser = await userService.getUserById(id);
            if (!existingUser) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }

            if (updateData.email && updateData.email !== existingUser.email) {
                const emailExists = await userRepository.getUserByEmail(updateData.email);
                if (emailExists && emailExists._id.toString() !== id) {
                    return ApiResponseHelper.error(res, "Email already exists", 400);
                }
            }

            if (updateData.username && updateData.username !== existingUser.username) {
                const usernameExists = await userRepository.getUserByUsername(updateData.username);
                if (usernameExists && usernameExists._id.toString() !== id) {
                    return ApiResponseHelper.error(res, "Username already exists", 400);
                }
            }

            const updatedUser = await userService.updateUser(id, updateData);
            return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const role = req.query.role as string;
            const status = req.query.status as string;

            const { data, total } = await userService.getPaginatedUsers(page, limit, search, role, status);
            
            return res.status(200).json({
                success: true,
                message: "Users fetched successfully",
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const user = await userService.getUserById(id);
            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, user, "User fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async adminCreateUser(req: Request, res: Response) {
        try {
            const parsedData = AdminCreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, formatZodError(parsedData.error), 400);
            }

            const userData = { ...parsedData.data } as any;
            if (req.file) {
                userData.profilePicture = `/uploads/profile_pics/${req.file.filename}`;
            }

            const user = await userService.createUser(userData);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const user = await userService.getUserById(id);
            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            await userService.deleteUser(id);
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}