import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const ChatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/chat`,
    credentials: "include",
  }),
  tagTypes: ["Conversations", "Messages"],
  endpoints: (builder) => ({
    // Get or create conversation between buyer and a seller
    getOrCreateConversation: builder.query({
      query: (sellerId: string) => `/conversation/${sellerId}`,
      providesTags: (_result, _err, sellerId) => [{ type: "Conversations", id: sellerId }],
    }),

    // Get all conversations for the current user
    getConversations: builder.query({
      query: () => "/conversations",
      providesTags: ["Conversations"],
    }),

    // Get messages for a conversation
    getMessages: builder.query({
      query: ({ conversationId, page = 1 }: { conversationId: string; page?: number }) =>
        `/messages/${conversationId}?page=${page}`,
      providesTags: (_result, _err, { conversationId }) => [
        { type: "Messages", id: conversationId },
      ],
    }),

    // Upload a chat image — returns { imageUrl }
    uploadChatImage: builder.mutation({
      query: (formData: FormData) => ({
        url: "/upload-image",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetOrCreateConversationQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useUploadChatImageMutation,
} = ChatApi;
