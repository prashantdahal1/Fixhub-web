import mongoose, { Schema, Document } from "mongoose";

export interface IDbUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: "admin" | "customer" | "professional";
  phoneNumber?: string;
  profilePicture?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DbUserSchema = new Schema<IDbUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "customer", "professional"], default: "customer" },
    phoneNumber: { type: String },
    profilePicture: { type: String, default: "" },
    status: { type: String, default: "active" }
  },
  {
    timestamps: true
  }
);

export const DbUser = mongoose.models.User || mongoose.model<IDbUser>("User", DbUserSchema);
