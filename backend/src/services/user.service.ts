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
        const isPasswordValid = await bcrypt.compare(
            loginData.password,
            user.password
        );
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

    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await userRepository.update(id, updateData);
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
}