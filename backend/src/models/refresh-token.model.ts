import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ userId: 1, expiresAt: 1 });

export const RefreshTokenModel = mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
