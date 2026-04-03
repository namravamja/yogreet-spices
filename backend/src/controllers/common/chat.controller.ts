import { Request, Response } from "express";
import mongoose from "mongoose";
import { ChatConversation } from "../../models/ChatConversation";
import { ChatMessage } from "../../models/ChatMessage";
import { Buyer } from "../../models/Buyer";
import { Seller } from "../../models/Seller";

// GET /api/chat/conversation/:sellerId  (called by buyer)
export const getOrCreateConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const buyerId = user.id;
    const { sellerId } = req.params as { sellerId: string };

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      res.status(400).json({ success: false, message: "Invalid seller ID" });
      return;
    }

    let conversation = await ChatConversation.findOne({
      buyerId: new mongoose.Types.ObjectId(buyerId),
      sellerId: new mongoose.Types.ObjectId(sellerId),
    });

    if (!conversation) {
      conversation = await ChatConversation.create({
        buyerId: new mongoose.Types.ObjectId(buyerId),
        sellerId: new mongoose.Types.ObjectId(sellerId),
      });
    }

    // Populate seller info for the buyer
    const seller = await Seller.findById(sellerId).select("fullName storeName businessLogo profilePicture").lean();

    res.status(200).json({
      success: true,
      data: {
        _id: conversation._id,
        buyerId: conversation.buyerId,
        sellerId: conversation.sellerId,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        buyerUnreadCount: conversation.buyerUnreadCount,
        sellerUnreadCount: conversation.sellerUnreadCount,
        createdAt: conversation.createdAt,
        seller: seller
          ? {
              _id: (seller as any)._id,
              name: (seller as any).fullName || (seller as any).storeName || "Seller",
              avatar: (seller as any).businessLogo || (seller as any).profilePicture || null,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[Chat] getOrCreateConversation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/chat/conversations  (buyer and seller)
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user.id;
    const role = user.role?.toLowerCase();

    const filter =
      role === "buyer"
        ? { buyerId: new mongoose.Types.ObjectId(userId) }
        : { sellerId: new mongoose.Types.ObjectId(userId) };

    const conversations = await ChatConversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .lean();

    // Populate the other party's info
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        if (role === "buyer") {
          const seller = await Seller.findById(conv.sellerId)
            .select("fullName storeName businessLogo profilePicture")
            .lean();
          return {
            ...conv,
            otherParty: seller
              ? {
                  _id: (seller as any)._id,
                  name: (seller as any).fullName || (seller as any).storeName || "Seller",
                  avatar: (seller as any).businessLogo || (seller as any).profilePicture || null,
                }
              : null,
          };
        } else {
          const buyer = await Buyer.findById(conv.buyerId)
            .select("firstName lastName avatar")
            .lean();
          return {
            ...conv,
            otherParty: buyer
              ? {
                  _id: (buyer as any)._id,
                  name: [(buyer as any).firstName, (buyer as any).lastName]
                    .filter(Boolean)
                    .join(" ") || "Buyer",
                  avatar: (buyer as any).avatar || null,
                }
              : null,
          };
        }
      })
    );

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error("[Chat] getConversations error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/chat/messages/:conversationId
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user.id;
    const { conversationId } = req.params as { conversationId: string };
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = 50;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({ success: false, message: "Invalid conversation ID" });
      return;
    }

    const conv = await ChatConversation.findById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    // Verify access
    const belongs =
      conv.buyerId.toString() === userId || conv.sellerId.toString() === userId;
    if (!belongs) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Mark messages from the other side as read
    const role = user.role?.toLowerCase();
    if (role === "buyer") {
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

    res.status(200).json({
      success: true,
      data: messages.reverse(), // oldest first
    });
  } catch (err) {
    console.error("[Chat] getMessages error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/chat/upload-image
// Multer (Cloudinary) attaches the file; the actual DB message is saved via socket.
// This endpoint only uploads the image and returns the URL.
export const uploadChatImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user.id;
    const { conversationId } = req.body;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({ success: false, message: "Invalid conversation ID" });
      return;
    }

    const conv = await ChatConversation.findById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    const belongs =
      conv.buyerId.toString() === userId || conv.sellerId.toString() === userId;
    if (!belongs) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ success: false, message: "No image provided" });
      return;
    }

    // Cloudinary storage attaches secure_url to file.path or file.secure_url
    const imageUrl: string = (file as any).secure_url || (file as any).path || "";
    if (!imageUrl) {
      res.status(500).json({ success: false, message: "Upload failed" });
      return;
    }

    res.status(200).json({ success: true, imageUrl });
  } catch (err) {
    console.error("[Chat] uploadChatImage error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
