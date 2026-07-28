import type { Request, Response } from "express";
import { NotificationModel } from "../../models/notification.model.js";
import { ApiResponseHelper } from "../../shared/utils/apihelper.util.js";
import { HttpException } from "../../shared/exceptions/http-exception.js";
import { notificationEvents } from "../../shared/utils/notification.util.js";

export class NotificationController {
  getAll = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const notifications = await NotificationModel.find({ userId: user._id as any })
      .sort({ createdAt: -1 })
      .limit(100);
    return ApiResponseHelper.success(res, notifications, "Notifications retrieved successfully");
  };

  stream = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user._id.toString();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    res.write("event: connected\n");
    res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);

    const sendNotification = (notification: unknown) => {
      res.write("event: notification\n");
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    };

    const heartbeat = setInterval(() => {
      res.write(": keep-alive\n\n");
    }, 25000);

    notificationEvents.on(userId, sendNotification);

    req.on("close", () => {
      clearInterval(heartbeat);
      notificationEvents.off(userId, sendNotification);
      res.end();
    });
  };

  markRead = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;

    const notif = await NotificationModel.findOneAndUpdate(
      { _id: id as any, userId: user._id as any } as any,
      { read: true },
      { new: true }
    );

    if (!notif) {
      throw new HttpException(404, "Notification not found");
    }

    return ApiResponseHelper.success(res, notif, "Notification marked as read");
  };

  markAllRead = async (req: Request, res: Response) => {
    const user = (req as any).user;

    await NotificationModel.updateMany(
      { userId: user._id as any, read: false } as any,
      { read: true }
    );

    return ApiResponseHelper.success(res, null, "All notifications marked as read");
  };

  deleteOne = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;

    const notif = await NotificationModel.findOneAndDelete({ _id: id as any, userId: user._id as any } as any);
    if (!notif) {
      throw new HttpException(404, "Notification not found");
    }

    return ApiResponseHelper.success(res, null, "Notification deleted successfully");
  };

  deleteAll = async (req: Request, res: Response) => {
    const user = (req as any).user;

    await NotificationModel.deleteMany({ userId: user._id as any } as any);

    return ApiResponseHelper.success(res, null, "All notifications deleted");
  };
}
