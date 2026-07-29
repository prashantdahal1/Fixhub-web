import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketDeletion extends Document {
  ticketId: string;
  deletedBy?: mongoose.Types.ObjectId | string;
  reason?: string;
  createdAt: Date;
}

const TicketDeletionSchema = new Schema<ITicketDeletion>(
  {
    ticketId: { type: String, required: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    reason: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TicketDeletionModel = mongoose.model<ITicketDeletion>('TicketDeletion', TicketDeletionSchema);
