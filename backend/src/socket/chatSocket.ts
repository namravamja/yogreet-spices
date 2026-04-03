import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { ChatConversation } from "../models/ChatConversation";
import { ChatMessage } from "../models/ChatMessage";
import mongoose from "mongoose";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: "buyer" | "seller";
}

// Map userId -> Set of socket ids (one user can have multiple tabs)
const onlineUsers = new Map<string, Set<string>>();

function addOnlineUser(userId: string, socketId: string) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId)!.add(socketId);
}

function removeOnlineUser(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) onlineUsers.delete(userId);
  }
}

function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId) && onlineUsers.get(userId)!.size > 0;
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Auth middleware — validate JWT from cookie or auth header
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
        socket.handshake.headers?.cookie
          ?.split(";")
          .find((c: string) => c.trim().startsWith("token="))
          ?.split("=")[1];

      if (!token) return next(new Error("Authentication required"));

      const secret = process.env.JWT_SECRET || "secret";
      const decoded = jwt.verify(token, secret) as any;

      socket.userId = decoded.id || decoded._id || decoded.userId;
      socket.userRole = (decoded.role as string)?.toLowerCase() as "buyer" | "seller";

      if (!socket.userId) return next(new Error("Invalid token payload"));
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    addOnlineUser(userId, socket.id);

    // Join personal room for direct messages
    socket.join(`user:${userId}`);

    console.log(`[Socket] ${userRole} ${userId} connected (${socket.id})`);

    // ── Join a conversation room ──────────────────────────────────────────
    socket.on("join_conversation", async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) return;

        const conv = await ChatConversation.findById(conversationId);
        if (!conv) return;

        // Verify the user belongs to this conversation
        const belongs =
          conv.buyerId.toString() === userId || conv.sellerId.toString() === userId;
        if (!belongs) return;

        socket.join(`conv:${conversationId}`);

        // Mark messages as read when joining
        if (userRole === "buyer") {
          await ChatMessage.updateMany(
            { conversationId, senderRole: "seller", read: false },
            { $set: { read: true } }
          );
          await ChatConversation.findByIdAndUpdate(conversationId, { buyerUnreadCount: 0 });
        } else {
          await ChatMessage.updateMany(
            { conversationId, senderRole: "buyer", read: false },
            { $set: { read: true } }
          );
          await ChatConversation.findByIdAndUpdate(conversationId, { sellerUnreadCount: 0 });
        }

        socket.emit("joined_conversation", { conversationId });
      } catch (err) {
        console.error("[Socket] join_conversation error:", err);
      }
    });

    // ── Send a message ────────────────────────────────────────────────────
    socket.on(
      "send_message",
      async ({
        conversationId,
        text,
        imageUrl,
      }: {
        conversationId: string;
        text?: string;
        imageUrl?: string;
      }) => {
        try {
          const trimmedText = (text || "").trim().slice(0, 2000);
          const safeImageUrl = imageUrl?.startsWith("https://") ? imageUrl : undefined;

          // Must have at least text or image
          if (!conversationId || (!trimmedText && !safeImageUrl)) return;
          if (!mongoose.Types.ObjectId.isValid(conversationId)) return;

          const conv = await ChatConversation.findById(conversationId);
          if (!conv) return;

          const belongs =
            conv.buyerId.toString() === userId ||
            conv.sellerId.toString() === userId;
          if (!belongs) return;

          // Save message to DB
          const message = await ChatMessage.create({
            conversationId,
            senderId: new mongoose.Types.ObjectId(userId),
            senderRole: userRole,
            text: trimmedText,
            imageUrl: safeImageUrl,
            read: false,
          });

          // Update conversation last message & unread counts
          const lastMessagePreview = trimmedText || "📷 Image";
          const updateFields: Record<string, any> = {
            lastMessage: lastMessagePreview,
            lastMessageAt: new Date(),
          };

          if (userRole === "buyer") {
            updateFields.$inc = { sellerUnreadCount: 1 };
          } else {
            updateFields.$inc = { buyerUnreadCount: 1 };
          }

          await ChatConversation.findByIdAndUpdate(conversationId, updateFields);

          const payload = {
            _id: (message as any)._id,
            conversationId,
            senderId: userId,
            senderRole: userRole,
            text: trimmedText,
            imageUrl: safeImageUrl ?? null,
            read: false,
            createdAt: (message as any).createdAt,
          };

          // Broadcast to conversation room (both participants)
          io.to(`conv:${conversationId}`).emit("new_message", payload);

          // Notify the other party's personal room even if they're not in the conv room
          const otherId =
            userRole === "buyer"
              ? conv.sellerId.toString()
              : conv.buyerId.toString();

          io.to(`user:${otherId}`).emit("conversation_updated", {
            conversationId,
            lastMessage: lastMessagePreview,
            lastMessageAt: new Date(),
            senderId: userId,
            senderRole: userRole,
          });
        } catch (err) {
          console.error("[Socket] send_message error:", err);
        }
      }
    );

    // ── Mark messages as read ─────────────────────────────────────────────
    socket.on("mark_read", async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
        if (userRole === "buyer") {
          await ChatMessage.updateMany(
            { conversationId, senderRole: "seller", read: false },
            { $set: { read: true } }
          );
          await ChatConversation.findByIdAndUpdate(conversationId, { buyerUnreadCount: 0 });
        } else {
          await ChatMessage.updateMany(
            { conversationId, senderRole: "buyer", read: false },
            { $set: { read: true } }
          );
          await ChatConversation.findByIdAndUpdate(conversationId, { sellerUnreadCount: 0 });
        }

        socket.emit("messages_read", { conversationId });
      } catch (err) {
        console.error("[Socket] mark_read error:", err);
      }
    });

    // ── Typing indicators ─────────────────────────────────────────────────
    socket.on("typing_start", ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit("typing_start", { userId, userRole });
    });

    socket.on("typing_stop", ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit("typing_stop", { userId, userRole });
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      removeOnlineUser(userId, socket.id);
      console.log(`[Socket] ${userRole} ${userId} disconnected (${socket.id})`);
    });
  });

  return io;
}
