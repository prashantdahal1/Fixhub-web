import mongoose, { Schema, Document } from "mongoose";
import { type UserType } from '../types/user.type.js';

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    profilePicture?: string;
}

const UserMongoSchema: Schema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "customer", "professional"], default: "customer" },
        phoneNumber: { type: String },
        profilePicture: { type: String, default: '' },
    },
    {
        timestamps: true
    }
);

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);