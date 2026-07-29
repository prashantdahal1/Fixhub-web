import mongoose, { Schema, Document } from "mongoose";

export interface IAdditionalService extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  status: "pending" | "approved" | "rejected" | "completed";
  rejectionReason?: string;
  customerApprovedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdditionalServiceSchema = new Schema<IAdditionalService>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    professionalId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    customerApprovedAt: { type: Date },
  },
  { timestamps: true }
);

AdditionalServiceSchema.index({ bookingId: 1 });
AdditionalServiceSchema.index({ professionalId: 1, status: 1 });
AdditionalServiceSchema.index({ customerId: 1, status: 1 });

export const AdditionalServiceModel = mongoose.model<IAdditionalService>("AdditionalService", AdditionalServiceSchema);
