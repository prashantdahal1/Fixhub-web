import { NotificationModel } from "../models/notification.model.js";
import { UserModel } from "../models/user.model.js";
import type mongoose from "mongoose";
import { EventEmitter } from "events";
import { broadcastRealtimeEvent } from "./realtime.util.js";

export const notificationEvents = new EventEmitter();

export async function createNotification(
  userId: mongoose.Types.ObjectId | string,
  title: string,
  body: string,
  type: "booking" | "confirm" | "done" | "payment"
) {
  try {
    const notification = await NotificationModel.create({
      userId,
      title,
      body,
      type,
      read: false,
    });
    const notificationData = notification.toObject();
    notificationEvents.emit(userId.toString(), notificationData);
    broadcastRealtimeEvent(
      "notification",
      notificationData as unknown as Record<string, unknown>
    );
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function createAdminNotification(
  title: string,
  body: string,
  type: "booking" | "confirm" | "done" | "payment"
) {
  try {
    const admins = await UserModel.find({ role: "admin" }).select("_id");
    await Promise.all(
      admins.map((admin) =>
        createNotification(admin._id, title, body, type)
      )
    );
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
