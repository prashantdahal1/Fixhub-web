import mongoose, { Schema, Document } from "mongoose";

export interface IDbUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "customer" | "professional";
  phoneNumber?: string;
  profilePicture?: string;
  address?: string;
  province?: string;
  city?: string;
  status?: string;
  isVerified?: boolean;
  verificationDocument?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DbUserSchema = new Schema<IDbUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    // Required so Mongoose strict mode does not strip passwords on create/update.
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer", "professional"], default: "customer" },
    phoneNumber: { type: String },
    profilePicture: { type: String, default: "" },
    address: { type: String, default: "" },
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    status: { type: String, enum: ["active", "pending", "suspended"], default: "active" },
    isVerified: { type: Boolean, default: false },
    verificationDocument: { type: String, default: "" },
  },
  {
    timestamps: true
  }
);

export const DbUser = mongoose.models.User || mongoose.model<IDbUser>("User", DbUserSchema);
