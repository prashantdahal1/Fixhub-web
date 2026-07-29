import type { Request, Response } from "express";
import { ApiResponseHelper } from "../../shared/utils/apihelper.util.js";
import { HttpException } from "../../shared/exceptions/http-exception.js";
import { chatService } from "./chat.service.js";

export class MessageController {
  async getMessagesByBooking(req: Request, res: Response) {
    const user = (req as any).user;
    const bookingId = (req.query.bookingId as string) || (req.params.bookingId as string);

    if (!bookingId) {
      throw new HttpException(400, "bookingId query parameter is required");
    }

    const messages = await chatService.getMessagesForBooking(bookingId, user);
    return ApiResponseHelper.success(res, messages, "Chat messages retrieved successfully");
  }
}
