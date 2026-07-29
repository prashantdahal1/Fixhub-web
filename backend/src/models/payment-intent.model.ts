import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentIntent extends Document {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  address: string;
  notes: string;
  amount: number;
  provider: "esewa" | "khalti" | "cod";
  promoCode?: string;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentIntentSchema = new Schema<IPaymentIntent>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    scheduledAt: { type: Date, required: true },
    address: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    provider: { type: String, enum: ["esewa", "khalti", "cod"], required: true },
    promoCode: { type: String, trim: true, uppercase: true },
    discount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Auto-delete intents that were never completed (2 hours TTL)
PaymentIntentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

export const PaymentIntentModel = mongoose.model<IPaymentIntent>(
  "PaymentIntent",
  PaymentIntentSchema
);
