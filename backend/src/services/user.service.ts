import { UserMongoRepository } from '../repositories/user.repository.js';
import { type CreateUserDTO, type LoginUserDTO } from '../dtos/user.dto.js';
import type { IUser } from '../models/user.model.js';
import { HttpException } from '../exceptions/http-exception.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from '../configs/constant.js';

const userRepository = new UserMongoRepository();

export class UserService {
    async createUser(userData: CreateUserDTO): Promise<IUser> {
        try {
            const existingEmail = await userRepository.getUserByEmail(userData.email);
            if (existingEmail) {
                throw new HttpException(400, "Email already exists");
            }
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                throw new HttpException(400, "Username already exists");
            }
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
            const user = await userRepository.createUser(userData as any);
            return user;
        } catch (error: any) {
            console.error("Mongoose/MongoDB Save Error in UserService:", error);
            throw error;
        }
    }

    async loginUser(loginData: LoginUserDTO){
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
        }
        if (!loginData.password) {
            throw new HttpException(400, "Password is required");
        }
        if (!user.password) {
            // Account created without a persisted password (e.g. old admin UI path)
            throw new HttpException(
                400,
                "This account has no password set. Please use Forgot Password or ask an admin to reset it."
            );
        }
        let isPasswordValid: boolean;
        try {
            isPasswordValid = await bcrypt.compare(
                loginData.password,
                user.password
            );
        } catch (err) {
            console.error("bcrypt.compare failed:", err);
            throw new HttpException(400, "Invalid password format");
        }
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid password");
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        return { user, token }
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await userRepository.getUserById(id);
    }

    async getPaginatedUsers(page: number, limit: number, search?: string, role?: string, status?: string) {
        return await userRepository.getPaginatedUsers(page, limit, search, role, status);
    }

    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await userRepository.update(id, updateData);
    }

    async deleteUser(id: string): Promise<boolean> {
        return await userRepository.delete(id);
    }

    async updatePassword(id: string, passwordData: any): Promise<void> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        const isPasswordValid = await bcrypt.compare(passwordData.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid old password");
        }
        const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);
        await userRepository.update(id, { password: hashedPassword });
    }

    async getUnverifiedProfessionals(): Promise<IUser[]> {
        return await userRepository.getUnverifiedProfessionals();
    }

    async verifyProfessional(id: string): Promise<IUser | null> {
        return await userRepository.update(id, { isVerified: true });
    }
}