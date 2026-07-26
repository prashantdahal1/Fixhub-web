import { IncomingMessage, Server as HttpServer } from "http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { WebSocketServer, type WebSocket } from "ws";
import { ChatMessageModel } from "../models/chat-message.model.js";
import { SECRET_KEY } from "../configs/constant.js";

export interface RealtimeEnvelope {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

const clients = new Set<AuthenticatedWebSocket>();
let wss: WebSocketServer | null = null;

function buildEnvelope(type: string, payload: Record<string, unknown>): string {
  return JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastRealtimeEvent(type: string, payload: Record<string, unknown>): void {
  if (!wss) return;
  const message = buildEnvelope(type, payload);
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

function parseIncomingMessage(data: unknown): RealtimeEnvelope | null {
  if (typeof data !== "string" && !Buffer.isBuffer(data)) {
    return null;
  }

  try {
    const parsed = JSON.parse(data.toString());
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.type === "string" &&
      typeof parsed.payload === "object" &&
      parsed.payload !== null
    ) {
      return {
        type: parsed.type,
        payload: parsed.payload as Record<string, unknown>,
        timestamp: typeof parsed.timestamp === "string"
          ? parsed.timestamp
          : new Date().toISOString(),
      };
    }
  } catch {
    // Ignore malformed JSON.
  }
  return null;
}

async function handleChatMessage(payload: Record<string, unknown>, authenticatedSenderId: string) {
  const bookingId = payload["bookingId"]?.toString() ?? "";
  const senderName = payload["senderName"]?.toString() ?? "";
  const text = payload["text"]?.toString() ?? "";

  if (!bookingId || !authenticatedSenderId || !senderName || !text.trim()) {
    return;
  }

  const senderId = new mongoose.Types.ObjectId(authenticatedSenderId);

  const chat = await ChatMessageModel.create({
    bookingId: new mongoose.Types.ObjectId(bookingId),
    senderId,
    senderName,
    text: text.trim(),
  });

  broadcastRealtimeEvent("chat_message", {
    id: chat._id.toString(),
    bookingId: chat.bookingId.toString(),
    senderId: chat.senderId.toString(),
    senderName: chat.senderName,
    text: chat.text,
    timestamp: chat.createdAt.toISOString(),
  });
}

function parseTokenFromMessage(data: unknown): string | null {
  if (typeof data !== "string" && !Buffer.isBuffer(data)) return null;

  try {
    const parsed = JSON.parse(data.toString());
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.type === "string" &&
      typeof parsed.payload === "object" &&
      parsed.payload !== null
    ) {
      const token = (parsed.payload as Record<string, unknown>)["token"];
      return typeof token === "string" ? token : null;
    }
  } catch {
    // Ignore malformed JSON.
  }
  return null;
}

function verifyWebSocketToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as Record<string, any>;
    if (decoded?.id && typeof decoded.id === "string") {
      return decoded.id;
    }
  } catch {
    // Invalid or expired token.
  }
  return null;
}

export function createRealtimeWebSocketServer(server: HttpServer) {
  if (wss) return wss;

  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket: AuthenticatedWebSocket, request: IncomingMessage) => {
    const url = request.url ?? "";
    const parsed = new URL(url, `http://${request.headers.host}`);
    const token = parsed.searchParams.get("token") || undefined;
    const userId = token ? verifyWebSocketToken(token) : undefined;

    if (!userId) {
      socket.close(4401, "Unauthorized: invalid or missing token");
      return;
    }

    socket.userId = userId;
    clients.add(socket);

    socket.on("message", async (data) => {
      const envelope = parseIncomingMessage(data);
      if (!envelope) return;

      if (envelope.type === "chat_message") {
        await handleChatMessage(envelope.payload, socket.userId!);
        return;
      }

      if (envelope.type === "notification") {
        broadcastRealtimeEvent("notification", envelope.payload);
      }
    });

    socket.on("close", () => {
      clients.delete(socket);
    });

    socket.on("error", () => {
      clients.delete(socket);
    });

    socket.send(buildEnvelope("connected", { ok: true }));
  });

  return wss;
}
