import { 
  sendDeliveryPartnerAssignedToBuyer,
  sendDeliveryPartnerAssignedToSeller,
  sendStatusUpdateEmail,
  sendIssueReportedEmail
} from "../../helpers/deliveryMailer";
import { Buyer, Seller, Admin, Order } from "../../models";

/**
 * Send delivery partner assigned notifications to buyer and seller
 */
export const notifyDeliveryPartnerAssigned = async (
  orderId: string,
  deliveryPartnerName: string
): Promise<void> => {
  try {
    const order = await Order.findById(orderId)
      .populate("buyerId", "email firstName lastName")
      .populate("sellerId", "email fullName");

    if (!order) {
      console.error(`Order ${orderId} not found for notification`);
      return;
    }

    const buyer = order.buyerId as any;
    const seller = order.sellerId as any;

    // Send to buyer
    if (buyer?.email) {
      const buyerName = [buyer.firstName, buyer.lastName].filter(Boolean).join(" ") || "Customer";
      await sendDeliveryPartnerAssignedToBuyer(
        buyer.email,
        buyerName,
        orderId,
        deliveryPartnerName
      );
    }

    // Send to seller
    if (seller?.email) {
      const sellerName = seller.fullName || "Seller";
      await sendDeliveryPartnerAssignedToSeller(
        seller.email,
        sellerName,
        orderId,
        deliveryPartnerName
      );
    }
  } catch (error) {
    console.error("Error sending delivery partner assigned notifications:", error);
    // Don't throw - notifications should not break the main flow
  }
};

/**
 * Send status update notifications to buyer and seller
 */
export const notifyStatusUpdate = async (
  orderId: string,
  newStatus: string
): Promise<void> => {
  try {
    // Only send notifications for major status updates
    const notifiableStatuses = ["picked_up", "in_transit", "out_for_delivery", "delivered"];
    
    if (!notifiableStatuses.includes(newStatus)) {
      return;
    }

    const order = await Order.findById(orderId)
      .populate("buyerId", "email firstName lastName")
      .populate("sellerId", "email fullName");

    if (!order) {
      console.error(`Order ${orderId} not found for notification`);
      return;
    }

    const buyer = order.buyerId as any;
    const seller = order.sellerId as any;

    // Send to buyer
    if (buyer?.email) {
      const buyerName = [buyer.firstName, buyer.lastName].filter(Boolean).join(" ") || "Customer";
      await sendStatusUpdateEmail(
        buyer.email,
        buyerName,
        orderId,
        newStatus,
        "buyer"
      );
    }

    // Send to seller
    if (seller?.email) {
      const sellerName = seller.fullName || "Seller";
      await sendStatusUpdateEmail(
        seller.email,
        sellerName,
        orderId,
        newStatus,
        "seller"
      );
    }
  } catch (error) {
    console.error("Error sending status update notifications:", error);
    // Don't throw - notifications should not break the main flow
  }
};

/**
 * Send issue reported notifications to buyer, seller, and admin
 */
export const notifyIssueReported = async (
  orderId: string,
  issueType: string,
  issueDescription: string
): Promise<void> => {
  try {
    const order = await Order.findById(orderId)
      .populate("buyerId", "email firstName lastName")
      .populate("sellerId", "email fullName");

    if (!order) {
      console.error(`Order ${orderId} not found for notification`);
      return;
    }

    const buyer = order.buyerId as any;
    const seller = order.sellerId as any;

    // Send to buyer
    if (buyer?.email) {
      const buyerName = [buyer.firstName, buyer.lastName].filter(Boolean).join(" ") || "Customer";
      await sendIssueReportedEmail(
        buyer.email,
        buyerName,
        orderId,
        issueType,
        issueDescription,
        "buyer"
      );
    }

    // Send to seller
    if (seller?.email) {
      const sellerName = seller.fullName || "Seller";
      await sendIssueReportedEmail(
        seller.email,
        sellerName,
        orderId,
        issueType,
        issueDescription,
        "seller"
      );
    }

    // Send to all admins
    const admins = await Admin.find({}).select("username").lean();
    for (const admin of admins) {
      // Assuming admin email is username@domain or stored elsewhere
      // For now, we'll skip admin email notification or you can configure admin emails
      console.log(`Issue notification for admin: ${admin.username}`);
    }
  } catch (error) {
    console.error("Error sending issue reported notifications:", error);
    // Don't throw - notifications should not break the main flow
  }
};
