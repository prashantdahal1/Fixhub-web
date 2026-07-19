import { NotificationModel } from "../models/notification.model.js";
import type mongoose from "mongoose";

export async function createNotification(
  userId: mongoose.Types.ObjectId | string,
  title: string,
  body: string,
  type: "booking" | "confirm" | "done" | "payment"
) {
  try {
    await NotificationModel.create({
      userId,
      title,
      body,
      type,
      read: false,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
