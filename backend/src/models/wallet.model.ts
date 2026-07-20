import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  balance: number;
  held: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    held: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

WalletSchema.index({ userId: 1 });

export const WalletModel = mongoose.model<IWallet>("Wallet", WalletSchema);
