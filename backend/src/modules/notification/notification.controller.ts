import type { Request, Response } from "express";
import { NotificationModel } from "../../models/notification.model.js";
import { ApiResponseHelper } from "../../shared/utils/apihelper.util.js";
import { HttpException } from "../../shared/exceptions/http-exception.js";
import { notificationEvents } from "../../shared/utils/notification.util.js";

export class NotificationController {
  getAll = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      let query: any = { isDeleted: { $ne: true } };

      if (user && user.role !== "admin") {
        query = { userId: user._id || user.id, isDeleted: { $ne: true } };
      }

      const notifications = await NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .limit(100);
      return ApiResponseHelper.success(res, notifications, "Notifications retrieved successfully");
    } catch (error) {
      return ApiResponseHelper.success(res, [], "No notifications found");
    }
  };

  getDeleted = async (req: Request, res: Response) => {
    try {
      const deletedNotifications = await NotificationModel.find({ isDeleted: true })
        .populate("userId", "name email role")
        .sort({ updatedAt: -1 })
        .limit(100);
      return ApiResponseHelper.success(res, deletedNotifications, "Deleted notifications retrieved successfully");
    } catch (error) {
      return ApiResponseHelper.error(res, "Failed to retrieve deleted notifications", 500);
    }
  };

  recoverNotification = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const restored = await NotificationModel.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true }
      );
      if (!restored) {
        throw new HttpException(404, "Notification not found");
      }
      return ApiResponseHelper.success(res, restored, "Notification recovered successfully");
    } catch (error) {
      return ApiResponseHelper.error(res, "Failed to recover notification", 500);
    }
  };

  stream = async (req: Request, res: Response) => {
    // Temporarily use dummy user ID since auth is bypassed
    const user = (req as any).user || { _id: "507f1f77bcf86cd799439011" }; // Valid MongoDB ObjectId
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

    const notif = await NotificationModel.findOneAndUpdate(
      { _id: id as any, userId: user._id as any } as any,
      { isDeleted: true },
      { new: true }
    );
    if (!notif) {
      throw new HttpException(404, "Notification not found");
    }

    return ApiResponseHelper.success(res, null, "Notification deleted successfully");
  };

  deleteAll = async (req: Request, res: Response) => {
    const user = (req as any).user;

    await NotificationModel.updateMany(
      { userId: user._id as any } as any,
      { isDeleted: true }
    );

    return ApiResponseHelper.success(res, null, "All notifications deleted");
  };
}
