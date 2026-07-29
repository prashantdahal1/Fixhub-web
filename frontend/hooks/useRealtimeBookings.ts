"use client";

import { useEffect, useRef, useCallback } from "react";
import { BACKEND_URL } from "@/lib/backend-url";

export type BookingUpdatedPayload = {
  bookingId: string;
  id: string;
  status: string;
  escrowStatus: string;
  customerId: string;
  professionalId: string;
  serviceTitle: string;
  serviceCategory: string;
};

export type RealtimeNotificationPayload = {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type RealtimeHandlers = {
  onBookingUpdated?: (payload: BookingUpdatedPayload) => void;
  onNotification?: (payload: RealtimeNotificationPayload) => void;
};

/**
 * useRealtimeBookings — subscribes to the backend WebSocket for live booking_updated
 * and notification events. Pass handlers to react to these events.
 *
 * Usage:
 *   useRealtimeBookings({
 *     onBookingUpdated: (p) => { ... update booking status in state ... },
 *     onNotification: (n) => { ... show toast or add to notifications list ... },
 *   });
 */
export function useRealtimeBookings(handlers: RealtimeHandlers) {
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);

  // Keep handlers ref current without re-triggering the effect
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const backendUrl = new URL(BACKEND_URL);
      const protocol = backendUrl.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${backendUrl.host}/ws?token=${encodeURIComponent(token)}`;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Send an auth envelope on open as a fallback (server accepts query param or initial message)
      socket.addEventListener("open", () => {
        try {
          socket.send(JSON.stringify({ type: "auth", payload: { token } }));
        } catch (e) {
          // ignore send errors
        }
      });

      socket.addEventListener("message", (event) => {
        try {
          const envelope = JSON.parse(event.data as string) as {
            type: string;
            payload: Record<string, unknown>;
          };

          if (envelope.type === "booking_updated" && handlersRef.current.onBookingUpdated) {
            handlersRef.current.onBookingUpdated(
              envelope.payload as unknown as BookingUpdatedPayload
            );
          }

          if (envelope.type === "notification" && handlersRef.current.onNotification) {
            handlersRef.current.onNotification(
              envelope.payload as unknown as RealtimeNotificationPayload
            );
          }
        } catch {
          // Ignore malformed messages
        }
      });

      socket.addEventListener("error", () => {
        socket.close();
      });

      socket.addEventListener("close", () => {
        socketRef.current = null;
        // Auto-reconnect after 3s
        setTimeout(() => connect(), 3000);
      });
    } catch {
      // Invalid URL or other error
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
