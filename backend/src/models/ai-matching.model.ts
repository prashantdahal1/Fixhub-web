import mongoose, { Schema, Document } from "mongoose";

export interface IMatchingScore extends Document {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  overallScore: number;
  locationScore: number;
  ratingScore: number;
  expertiseScore: number;
  availabilityScore: number;
  priceScore: number;
  factors: {
    distance: number;
    rating: number;
    reviewCount: number;
    categoryMatch: boolean;
    availability: number;
    priceCompetitiveness: number;
  };
  createdAt: Date;
}

const MatchingScoreSchema = new Schema<IMatchingScore>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    professionalId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    locationScore: { type: Number, required: true, min: 0, max: 100 },
    ratingScore: { type: Number, required: true, min: 0, max: 100 },
    expertiseScore: { type: Number, required: true, min: 0, max: 100 },
    availabilityScore: { type: Number, required: true, min: 0, max: 100 },
    priceScore: { type: Number, required: true, min: 0, max: 100 },
    factors: {
      distance: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      categoryMatch: { type: Boolean, default: false },
      availability: { type: Number, default: 0 },
      priceCompetitiveness: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

MatchingScoreSchema.index({ customerId: 1, serviceId: 1, overallScore: -1 });
MatchingScoreSchema.index({ professionalId: 1, createdAt: -1 });

export const MatchingScoreModel = mongoose.model<IMatchingScore>("MatchingScore", MatchingScoreSchema);
