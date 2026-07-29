import mongoose from 'mongoose';
import { UserModel, type IUser } from '../../models/user.model.js';

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
    getPaginatedUsers(page: number, limit: number, search?: string, role?: string, status?: string): Promise<{ data: IUser[], total: number }>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
    getUnverifiedProfessionals(): Promise<IUser[]>;
}

export class UserMongoRepository implements IUserRepository {
    private validateObjectId(id: string): boolean {
        return mongoose.isValidObjectId(id);
    }

    async getUserById(id: string): Promise<IUser | null> {
        if (!this.validateObjectId(id)) return null;
        return UserModel.findById(id);
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        if (!email || typeof email !== 'string') return null;
        return UserModel.findOne({ email: email.trim().toLowerCase() });
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        if (!username || typeof username !== 'string') return null;
        return UserModel.findOne({ username: username.trim() });
    }

    async createUser(user: Partial<IUser>): Promise<IUser> {
        if (!user.email || !user.username || !user.password) {
            throw new Error('Missing required user fields: email, username, password');
        }
        const normalizedUser = {
            ...user,
            email: user.email.trim().toLowerCase(),
            username: user.username.trim(),
        };

        return UserModel.create(normalizedUser);
    }

    async getAll(): Promise<IUser[]> {
        return UserModel.find().sort({ createdAt: -1 });
    }
    async getPaginatedUsers(page: number, limit: number, search?: string, role?: string, status?: string): Promise<{ data: IUser[], total: number }> {
        // Auto-migrate any unverified professionals saved with 'active' status to 'pending'
        await UserModel.updateMany(
            { role: 'professional', isVerified: false, status: { $ne: 'pending' } },
            { $set: { status: 'pending' } }
        );

        const query: any = {};
        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { email: regex },
                { username: regex },
                { firstName: regex },
                { lastName: regex },
            ];
        }
        if (role && role !== 'all') {
            query.role = role === 'expert' ? 'professional' : role;
        }
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = Math.max(0, page - 1) * limit;
        const [data, total] = await Promise.all([
            UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            UserModel.countDocuments(query)
        ]);

        return { data, total };
    }


    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        if (!this.validateObjectId(id)) return null;
        const normalizedUpdates: Partial<IUser> = { ...user };

        if (user.email) {
            normalizedUpdates.email = user.email.trim().toLowerCase();
        }
        if (user.username) {
            normalizedUpdates.username = user.username.trim();
        }

        return UserModel.findByIdAndUpdate(id, normalizedUpdates, { new: true, runValidators: true });
    }

    async delete(id: string): Promise<boolean> {
        if (!this.validateObjectId(id)) return false;
        const result = await UserModel.findByIdAndDelete(id);
        return !!result;
    }

    async getUnverifiedProfessionals(): Promise<IUser[]> {
        return UserModel.find({ role: 'professional', isVerified: false });
    }
}
