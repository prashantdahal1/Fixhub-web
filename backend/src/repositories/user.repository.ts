import { UserModel, type IUser } from '../models/user.model.js';

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
    async getUserById(id: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ _id: id });
        return found;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ email });
        return found;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ username });
        return found;
    }
    async createUser(user: Partial<IUser>): Promise<IUser> {
        const created = await UserModel.create(user);
        return created;
    }
    async getAll(): Promise<IUser[]> {
        const found = await UserModel.find();
        return found;
    }
    async getPaginatedUsers(page: number, limit: number, search?: string, role?: string, status?: string): Promise<{ data: IUser[], total: number }> {
        const query: any = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { email: regex },
                { firstName: regex },
                { lastName: regex }
            ];
        }
        if (role && role !== 'all') {
            query.role = role;
        }
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            UserModel.countDocuments(query)
        ]);
        
        return { data, total };
    }
    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const updated = await UserModel.findByIdAndUpdate(id, user, { new: true, runValidators: true });
        return updated;
    }
    async delete(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return !!result;
    }
    async getUnverifiedProfessionals(): Promise<IUser[]> {
        return await UserModel.find({ role: 'professional', isVerified: false });
    }
}