"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiSend, FiMessageCircle, FiChevronDown, FiImage, FiXCircle } from "react-icons/fi";
import Image from "next/image";
import { useSocket } from "@/contexts/SocketContext";
import { useGetOrCreateConversationQuery, useGetMessagesQuery, useUploadChatImageMutation } from "@/services/api/chatApi";
import { ChatApi } from "@/services/api/chatApi";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

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

interface BuyerChatWidgetProps {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string | null;
  buyerId: string;
  onClose: () => void;
}

export function BuyerChatWidget({
  sellerId,
  sellerName,
  sellerAvatar,
  buyerId,
  onClose,
}: BuyerChatWidgetProps) {
  const dispatch = useDispatch();
  const { joinConversation, sendMessage, markRead, onNewMessage, onTypingStart, onTypingStop, sendTypingStart, sendTypingStop } = useSocket();

  const [uploadChatImage, { isLoading: isUploading }] = useUploadChatImageMutation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sellerTyping, setSellerTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch or create conversation
  const { data: convData, isLoading: convLoading } = useGetOrCreateConversationQuery(sellerId, {
    skip: !sellerId,
  });

  useEffect(() => {
    if (convData?.data?._id) {
      setConversationId(convData.data._id);
    }
  }, [convData]);

  // Fetch existing messages
  const { data: messagesData } = useGetMessagesQuery(
    { conversationId: conversationId! },
    { skip: !conversationId }
  );

  useEffect(() => {
    if (messagesData?.data) {
      setMessages(messagesData.data);
    }
  }, [messagesData]);

  // Join socket room once we have conversationId
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      markRead(conversationId);
    }
  }, [conversationId, joinConversation, markRead]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // Deduplicate by _id
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Invalidate RTK query cache so conversations list updates
        dispatch(ChatApi.util.invalidateTags(["Conversations"]));
        // Mark as read
        if (msg.senderRole === "seller") {
          markRead(conversationId!);
        }
      }
    });
    return unsubscribe;
  }, [conversationId, onNewMessage, markRead, dispatch]);

  // Listen for typing events
  useEffect(() => {
    const unsubStart = onTypingStart((data) => {
      if (data.userRole === "seller") setSellerTyping(true);
    });
    const unsubStop = onTypingStop((data) => {
      if (data.userRole === "seller") setSellerTyping(false);
    });
    return () => {
      unsubStart();
      unsubStop();
    };
  }, [onTypingStart, onTypingStop]);

  // Auto scroll to bottom
  useEffect(() => {
    if (!minimized) {
      const container = messagesContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, [messages, minimized, sellerTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearImagePreview = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!conversationId) return;
    if (!trimmed && !selectedFile) return;

    let imageUrl: string | undefined;

    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("chatImage", selectedFile);
        formData.append("conversationId", conversationId);
        const res = await uploadChatImage(formData).unwrap();
        imageUrl = res.imageUrl;
      } catch {
        toast.error("Failed to upload image");
        return;
      }
    }

    sendMessage(conversationId, trimmed, imageUrl);
    setInputText("");
    setSelectedFile(null);
    setImagePreview(null);

    if (isTyping) {
      sendTypingStop(conversationId);
      setIsTyping(false);
    }
  }, [inputText, selectedFile, conversationId, sendMessage, isTyping, sendTypingStop, uploadChatImage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!conversationId) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTypingStart(conversationId);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStop(conversationId);
    }, 1500);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    return isToday ? "Today" : d.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[420px] max-h-[calc(100vh-5rem)] shadow-2xl rounded-lg overflow-hidden border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-yogreet-charcoal text-white">
        <div className="flex items-center gap-3 min-w-0">
          {sellerAvatar ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
              <Image src={sellerAvatar} alt={sellerName} fill className="object-cover" sizes="32px" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-yogreet-sage flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {sellerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{sellerName}</p>
            <p className="text-xs text-gray-300">Seller</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMinimized((v) => !v)}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={minimized ? "Expand chat" : "Minimize chat"}
          >
            <FiChevronDown
              className={`w-4 h-4 transition-transform ${minimized ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50" style={{ maxHeight: '400px', minHeight: '320px' }}>
            {convLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400">Connecting…</p>
              </div>
            )}

            {!convLoading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <FiMessageCircle className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-400">
                  Start a conversation with {sellerName}
                </p>
              </div>
            )}

            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.msgs.map((msg) => {
                  const isMine = msg.senderId === buyerId || msg.senderRole === "buyer";
                  return (
                    <div
                      key={msg._id}
                      className={`flex mb-1 ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                          isMine
                            ? "bg-yogreet-charcoal text-white rounded-br-none"
                            : "bg-white border border-gray-200 text-yogreet-charcoal rounded-bl-none"
                        }`}
                      >
                        {msg.imageUrl && (
                          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1">
                            <div className="relative w-40 h-40 rounded overflow-hidden">
                              <Image src={msg.imageUrl} alt="chat image" fill className="object-cover" sizes="160px" />
                            </div>
                          </a>
                        )}
                        {msg.text && <p className="wrap-break-word">{msg.text}</p>}
                        <p
                          className={`text-xs mt-1 text-right ${
                            isMine ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {sellerTyping && (
              <div className="flex justify-start mb-1">
                <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Image preview bar */}
          {imagePreview && (
            <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 bg-white">
              <div className="relative w-14 h-14 rounded overflow-hidden border border-gray-200 shrink-0">
                <Image src={imagePreview} alt="preview" fill className="object-cover" sizes="56px" />
              </div>
              <p className="flex-1 text-xs text-gray-500 truncate">{selectedFile?.name}</p>
              <button onClick={clearImagePreview} className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" aria-label="Remove image">
                <FiXCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-200 bg-white">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!conversationId}
              className="p-2 text-gray-400 hover:text-yogreet-sage disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Attach image"
            >
              <FiImage className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={2000}
              className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-yogreet-sage transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={(!inputText.trim() && !selectedFile) || !conversationId || isUploading}
              className="p-2 bg-yogreet-charcoal text-white rounded-md hover:bg-yogreet-charcoal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Send message"
            >
              {isUploading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
              ) : (
                <FiSend className="w-4 h-4" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
