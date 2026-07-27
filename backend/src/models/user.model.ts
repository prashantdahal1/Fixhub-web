import mongoose, { Schema, Document } from "mongoose";
import { type UserType } from '../shared/types/user.type.js';

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    profilePicture?: string;
    address?: string;
    province?: string;
    city?: string;
    status?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified: boolean;
    verificationDocument?: string;
    nationalIdFront?: string;
    nationalIdBack?: string;
    averageRating?: number;
    reviewCount?: number;
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
        address: { type: String, default: '' },
        province: { type: String, default: '' },
        city: { type: String, default: '' },
        status: { type: String, enum: ["active", "pending", "suspended"], default: "active" },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        isVerified: { type: Boolean, default: false },
        verificationDocument: { type: String, default: '' },
        nationalIdFront: { type: String, default: '' },
        nationalIdBack: { type: String, default: '' },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0, min: 0 },
    },
    {
        timestamps: true
    }
);


UserMongoSchema.index({ role: 1, status: 1 });
UserMongoSchema.index({ role: 1, isVerified: 1 });

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);