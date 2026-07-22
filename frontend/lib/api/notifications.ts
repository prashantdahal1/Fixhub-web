"use client";

export interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  type: "booking" | "confirm" | "done" | "payment";
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch("/api/v1/notifications", { credentials: "include" });
  const json = await res.json();
  return json.success ? json.data : [];
}

export function upsertNotification(
  notifications: NotificationItem[],
  notification: NotificationItem
) {
  const exists = notifications.some((item) => item._id === notification._id);
  if (exists) {
    return notifications.map((item) =>
      item._id === notification._id ? notification : item
    );
  }
  return [notification, ...notifications];
}
