import { NotificationModel } from "../models/notification.model.js";
import type mongoose from "mongoose";
import { EventEmitter } from "events";

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
    notificationEvents.emit(userId.toString(), notification.toObject());
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
