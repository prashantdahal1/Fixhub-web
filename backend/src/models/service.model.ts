import mongoose, { Schema, Document } from "mongoose";

export type ServiceCategory =
  | "electrician"
  | "plumber"
  | "ac_repair"
  | "painter"
  | "carpenter"
  | "cleaner"
  | "geyser"
  | "appliance_repair"
  | "pest_control"
  | "other";

export interface IService extends Document {
  _id: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  shortDescription: string;
  basePrice: number;
  priceUnit: "flat" | "per_hour" | "per_sqft";
  rating: number;
  reviewCount: number;
  imageUrl: string;
  tags: string[];
  specifications: { label: string; value: string }[];
  isActive: boolean;
  isCertified: boolean;
  estimatedDuration: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    professionalId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      required: true,
      enum: ["electrician", "plumber", "ac_repair", "painter", "carpenter", "cleaner", "geyser", "appliance_repair", "pest_control", "other"],
    },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 200 },
    basePrice: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, enum: ["flat", "per_hour", "per_sqft"], default: "flat" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    tags: [{ type: String }],
    specifications: [{ label: String, value: String }],
    isActive: { type: Boolean, default: true },
    isCertified: { type: Boolean, default: true },
    estimatedDuration: { type: String, default: "1-2 hours" },
  },
  { timestamps: true }
);

ServiceSchema.index({ category: 1, isActive: 1 });
ServiceSchema.index({ professionalId: 1, isActive: 1 });
ServiceSchema.index({ title: "text", description: "text", tags: "text" });

export const ServiceModel = mongoose.model<IService>("Service", ServiceSchema);
