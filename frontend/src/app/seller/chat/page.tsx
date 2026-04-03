"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FiMessageCircle, FiSend, FiSearch, FiImage, FiXCircle } from "react-icons/fi";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useGetConversationsQuery, useGetMessagesQuery, useUploadChatImageMutation } from "@/services/api/chatApi";
import { ChatApi } from "@/services/api/chatApi";
import { useSocket } from "@/contexts/SocketContext";
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

interface Conversation {
  _id: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  sellerUnreadCount: number;
  otherParty?: {
    _id: string;
    name: string;
    avatar: string | null;
  } | null;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return "Today";
  const diff = today.getTime() - d.getTime();
  if (diff < 2 * 24 * 60 * 60 * 1000) return "Yesterday";
  return d.toLocaleDateString();
}

export default function SellerChatPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth("seller");
  const sellerId = (user as any)?._id || (user as any)?.id || "";

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [buyerTyping, setBuyerTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadChatImage, { isLoading: isUploading }] = useUploadChatImageMutation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    joinConversation,
    sendMessage,
    markRead,
    onNewMessage,
    onConversationUpdated,
    onTypingStart,
    onTypingStop,
    sendTypingStart,
    sendTypingStop,
  } = useSocket();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch conversations list
  const { data: convsData, refetch: refetchConvs } = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (convsData?.data) {
      setConversations(convsData.data);
    }
  }, [convsData]);

  // Fetch messages for selected conversation
  const { data: messagesData } = useGetMessagesQuery(
    { conversationId: selectedConvId! },
    { skip: !selectedConvId }
  );

  useEffect(() => {
    if (messagesData?.data) {
      setMessages(messagesData.data);
    }
  }, [messagesData]);

  // Join socket room when conversation selected
  useEffect(() => {
    if (selectedConvId) {
      joinConversation(selectedConvId);
      markRead(selectedConvId);
      // Reset buyer typing
      setBuyerTyping(false);
    }
  }, [selectedConvId, joinConversation, markRead]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((msg) => {
      if (msg.conversationId === selectedConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        if (msg.senderRole === "buyer") {
          markRead(selectedConvId!);
        }
      }
      // Update conversations list unread count / last message
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.text,
                lastMessageAt: msg.createdAt,
                sellerUnreadCount:
                  msg.conversationId === selectedConvId
                    ? 0
                    : (c.sellerUnreadCount || 0) + (msg.senderRole === "buyer" ? 1 : 0),
              }
            : c
        )
      );
      dispatch(ChatApi.util.invalidateTags(["Conversations"]));
    });
    return unsubscribe;
  }, [selectedConvId, onNewMessage, markRead, dispatch]);

  // Listen for conversation_updated (when seller isn't in conv room)
  useEffect(() => {
    const unsubscribe = onConversationUpdated((update) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === update.conversationId
            ? {
                ...c,
                lastMessage: update.lastMessage,
                lastMessageAt: update.lastMessageAt,
                sellerUnreadCount:
                  c._id === selectedConvId
                    ? 0
                    : (c.sellerUnreadCount || 0) + (update.senderRole === "buyer" ? 1 : 0),
              }
            : c
        )
      );
    });
    return unsubscribe;
  }, [selectedConvId, onConversationUpdated]);

  // Typing indicators
  useEffect(() => {
    const unsubStart = onTypingStart((data) => {
      if (data.userRole === "buyer") setBuyerTyping(true);
    });
    const unsubStop = onTypingStop((data) => {
      if (data.userRole === "buyer") setBuyerTyping(false);
    });
    return () => {
      unsubStart();
      unsubStop();
    };
  }, [onTypingStart, onTypingStop]);

  // Auto scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, buyerTyping]);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearImagePreview = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!selectedConvId) return;
    if (!trimmed && !selectedFile) return;

    let imageUrl: string | undefined;

    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("chatImage", selectedFile);
        formData.append("conversationId", selectedConvId);
        const res = await uploadChatImage(formData).unwrap();
        imageUrl = res.imageUrl;
      } catch {
        toast.error("Failed to upload image");
        return;
      }
    }

    sendMessage(selectedConvId, trimmed, imageUrl);
    setInputText("");
    setSelectedFile(null);
    setImagePreview(null);

    if (isTyping) {
      sendTypingStop(selectedConvId);
      setIsTyping(false);
    }
  }, [inputText, selectedFile, selectedConvId, sendMessage, isTyping, sendTypingStop, uploadChatImage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!selectedConvId) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTypingStart(selectedConvId);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStop(selectedConvId);
    }, 1500);
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const name = c.otherParty?.name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find((c) => c._id === selectedConvId);

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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-yogreet-sage border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-poppins font-bold text-yogreet-charcoal mb-6">Messages</h1>

      <div className="flex border border-gray-200 rounded-lg overflow-hidden h-[600px]">
        {/* Conversation List */}
        <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search buyers…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-yogreet-sage transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
                <FiMessageCircle className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-400">No conversations yet</p>
              </div>
            )}

            {filteredConversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedConvId(conv._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer ${
                  selectedConvId === conv._id ? "bg-yogreet-sage/10 border-l-2 border-l-yogreet-sage" : ""
                }`}
              >
                {conv.otherParty?.avatar ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={conv.otherParty.avatar}
                      alt={conv.otherParty.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-yogreet-sage flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {(conv.otherParty?.name || "B").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-yogreet-charcoal truncate">
                      {conv.otherParty?.name || "Buyer"}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-gray-400 shrink-0 ml-1">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage || "Start a conversation"}
                    </p>
                    {conv.sellerUnreadCount > 0 && (
                      <span className="ml-2 shrink-0 bg-yogreet-sage text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.sellerUnreadCount > 9 ? "9+" : conv.sellerUnreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedConvId ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-yogreet-sage/10 flex items-center justify-center">
                <FiMessageCircle className="w-8 h-8 text-yogreet-sage" />
              </div>
              <h3 className="text-lg font-semibold text-yogreet-charcoal">Your Messages</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Select a conversation from the left to start chatting with your buyers.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                {selectedConv?.otherParty?.avatar ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={selectedConv.otherParty.avatar}
                      alt={selectedConv.otherParty.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-yogreet-sage flex items-center justify-center text-white font-semibold">
                    {(selectedConv?.otherParty?.name || "B").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-yogreet-charcoal">
                    {selectedConv?.otherParty?.name || "Buyer"}
                  </p>
                  <p className="text-xs text-gray-500">Buyer</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50">
                {groupedMessages.map((group) => (
                  <div key={group.date}>
                    <div className="flex items-center justify-center my-2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {group.date}
                      </span>
                    </div>
                    {group.msgs.map((msg) => {
                      const isMine = msg.senderId === sellerId || msg.senderRole === "seller";
                      return (
                        <div
                          key={msg._id}
                          className={`flex mb-1 ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                              isMine
                                ? "bg-yogreet-charcoal text-white rounded-br-none"
                                : "bg-white border border-gray-200 text-yogreet-charcoal rounded-bl-none"
                            }`}
                          >
                            {msg.imageUrl && (
                              <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1">
                                <div className="relative w-48 h-36 rounded overflow-hidden">
                                  <Image src={msg.imageUrl} alt="chat image" fill className="object-cover" sizes="192px" />
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
                {buyerTyping && (
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedConvId}
                  className="p-2 text-gray-400 hover:text-yogreet-sage disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Attach image"
                >
                  <FiImage className="w-4 h-4" />
                </button>
                <input
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
                  disabled={(!inputText.trim() && !selectedFile) || !selectedConvId || isUploading}
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
      </div>
    </div>
  );
}
