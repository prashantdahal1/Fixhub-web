import mongoose, { Schema, Document } from "mongoose";

export type TransactionType = "topup" | "hold" | "release" | "refund";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  bookingId?: mongoose.Types.ObjectId;
  note?: string;
  gateway?: "esewa" | "khalti";
  gatewayTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["topup", "hold", "release", "refund"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    note: { type: String, default: "" },
    gateway: { type: String, enum: ["esewa", "khalti"] },
    gatewayTransactionId: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ bookingId: 1 });
TransactionSchema.index({ gatewayTransactionId: 1 }, { unique: true, sparse: true });

export const TransactionModel = mongoose.model<ITransaction>("Transaction", TransactionSchema);
