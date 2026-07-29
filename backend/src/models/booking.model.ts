import mongoose, { Schema, Document } from "mongoose";

export type BookingStatus =
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type EscrowStatus = "none" | "held" | "released" | "refunded";

export type BookingAction = "start" | "complete" | "cancel";

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  address: string;
  notes?: string;
  amount: number;
  promoCode?: string;
  discount?: number;
  status: BookingStatus;
  escrowStatus: EscrowStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    professionalId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    scheduledAt: { type: Date, required: true },
    address: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    promoCode: { type: String, trim: true, uppercase: true },
    discount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["confirmed", "in_progress", "completed", "cancelled"],
      default: "confirmed",
    },
    escrowStatus: {
      type: String,
      enum: ["none", "held", "released", "refunded"],
      default: "none",
    },
  },
  { timestamps: true }
);

BookingSchema.index({ customerId: 1, createdAt: -1 });
BookingSchema.index({ professionalId: 1, status: 1 });
BookingSchema.index({ status: 1 });

// Prevent double-booking the same pro at the same time slot while active
BookingSchema.index(
  { professionalId: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["confirmed", "in_progress"] },
    },
  }
);

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
