import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceImageDeletion extends Document {
  serviceId: mongoose.Types.ObjectId;
  deletedBy?: mongoose.Types.ObjectId | string;
  oldImageUrl?: string;
  filename?: string;
  createdAt: Date;
}

const ServiceImageDeletionSchema = new Schema<IServiceImageDeletion>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    oldImageUrl: { type: String, default: '' },
    filename: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ServiceImageDeletionModel = mongoose.model<IServiceImageDeletion>(
  'ServiceImageDeletion',
  ServiceImageDeletionSchema
);
