import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

ChatMessageSchema.index({ bookingId: 1, createdAt: 1 });

export const ChatMessageModel = mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
