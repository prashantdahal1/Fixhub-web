import { NotificationModel } from "../models/notification.model.js";
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
