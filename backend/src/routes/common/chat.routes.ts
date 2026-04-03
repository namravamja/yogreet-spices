import express from "express";
import { verifyToken } from "../../middleware/authMiddleware";
import { uploadSingle, handleMulterError } from "../../middleware/multer";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  uploadChatImage,
} from "../../controllers/common/chat.controller";

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

// GET conversations for the current user (buyer or seller)
router.get("/conversations", getConversations);

// GET or create conversation between buyer and seller (buyer initiates)
router.get("/conversation/:sellerId", getOrCreateConversation);

// GET paginated messages for a conversation
router.get("/messages/:conversationId", getMessages);

// POST upload a chat image — returns { imageUrl }
router.post(
  "/upload-image",
  uploadSingle.single("chatImage"),
  handleMulterError,
  uploadChatImage
);

export default router;
