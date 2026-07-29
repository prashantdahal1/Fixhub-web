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
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch("/api/v1/notifications", {
      headers,
      credentials: "include"
    });

    if (!res.ok) {
      if (res.status === 401) {
        console.warn("Notifications unavailable: user is not authenticated.");
        return [];
      }

      const text = await res.text().catch(() => "");
      console.warn("Notifications request failed", { status: res.status, body: text });
      return [];
    }

    const json = await res.json().catch(() => null);
    return json?.success ? (json.data ?? []) : [];
  } catch (error) {
    console.warn("Notifications request failed", error);
    return [];
  }
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
