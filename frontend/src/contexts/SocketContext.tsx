"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: "buyer" | "seller";
  text: string;
  imageUrl?: string | null;
  read: boolean;
  createdAt: string;
}

interface ConversationUpdate {
  conversationId: string;
  lastMessage: string;
  lastMessageAt: string;
  senderId: string;
  senderRole: "buyer" | "seller";
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string, imageUrl?: string) => void;
  markRead: (conversationId: string) => void;
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;
  onNewMessage: (handler: (msg: ChatMessage) => void) => () => void;
  onConversationUpdated: (handler: (update: ConversationUpdate) => void) => () => void;
  onTypingStart: (handler: (data: { userId: string; userRole: string }) => void) => () => void;
  onTypingStop: (handler: (data: { userId: string; userRole: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("join_conversation", { conversationId });
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string, imageUrl?: string) => {
    socketRef.current?.emit("send_message", { conversationId, text, imageUrl });
  }, []);

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit("mark_read", { conversationId });
  }, []);

  const sendTypingStart = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing_start", { conversationId });
  }, []);

  const sendTypingStop = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing_stop", { conversationId });
  }, []);

  const onNewMessage = useCallback((handler: (msg: ChatMessage) => void) => {
    const s = socketRef.current;
    s?.on("new_message", handler);
    return () => { s?.off("new_message", handler); };
  }, []);

  const onConversationUpdated = useCallback((handler: (update: ConversationUpdate) => void) => {
    const s = socketRef.current;
    s?.on("conversation_updated", handler);
    return () => { s?.off("conversation_updated", handler); };
  }, []);

  const onTypingStart = useCallback((handler: (data: { userId: string; userRole: string }) => void) => {
    const s = socketRef.current;
    s?.on("typing_start", handler);
    return () => { s?.off("typing_start", handler); };
  }, []);

  const onTypingStop = useCallback((handler: (data: { userId: string; userRole: string }) => void) => {
    const s = socketRef.current;
    s?.on("typing_stop", handler);
    return () => { s?.off("typing_stop", handler); };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinConversation,
        sendMessage,
        markRead,
        sendTypingStart,
        sendTypingStop,
        onNewMessage,
        onConversationUpdated,
        onTypingStart,
        onTypingStop,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
}
