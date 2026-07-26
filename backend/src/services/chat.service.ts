import { ChatMessageModel, type IChatMessage } from "../models/chat-message.model.js";
import { HttpException } from "../exceptions/http-exception.js";
import type { IUser } from "../models/user.model.js";

export class ChatService {
  async getMessagesForBooking(bookingId: string, user: IUser): Promise<IChatMessage[]> {
    if (!bookingId) {
      throw new HttpException(400, "Booking ID is required");
    }

    return ChatMessageModel.find({ bookingId })
      .sort({ createdAt: 1 });
  }
}

export const chatService = new ChatService();
