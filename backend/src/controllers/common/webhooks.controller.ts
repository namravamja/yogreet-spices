import { Request, Response } from "express";
import { Payment } from "../../models/Payment";
import { Order } from "../../models/Order";
import { getPaymentService } from "../../services/payments";

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const bodyBuffer = req.body as any as Buffer;
    const bodyStr = bodyBuffer?.toString() || "";
    const payload = JSON.parse(bodyStr);
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    await getPaymentService("razorpay").verifyAndMarkHeld({ rawString: bodyStr, json: payload }, signature, process.env.RAZORPAY_WEBHOOK_SECRET);

    const event = payload?.event;
    if (event === "payment.captured") {
      const rzpOrderId = payload?.payload?.payment?.entity?.order_id;
      const rzpPaymentId = payload?.payload?.payment?.entity?.id;
      if (rzpOrderId) {
        const payment = await Payment.findOneAndUpdate(
          { gatewayOrderId: rzpOrderId, gateway: "razorpay" },
          { $set: { status: "succeeded", razorpayPaymentId: rzpPaymentId, webhookPayload: payload, signature } },
          { new: true }
        );
        if (payment) {
          const order = await Order.findById(payment.orderId);
          if (order) {
            order.paymentStatus = "held";
            order.mode = "test";
            order.gateway = "razorpay";
            order.currency = "INR";
            await order.save();
          }
        }
      }
    } else if (event === "payment.failed") {
      const rzpOrderId = payload?.payload?.payment?.entity?.order_id;
      await Payment.findOneAndUpdate(
        { gatewayOrderId: rzpOrderId, gateway: "razorpay" },
        { $set: { status: "failed", webhookPayload: payload, signature } }
      );
    }
    res.json({ received: true });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string | undefined;
    await getPaymentService("stripe").verifyAndMarkHeld(
      { raw: req.body as any },
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    const body: any = req.body;
    const intentId = body?.data?.object?.id;
    if (intentId) {
      const payment = await Payment.findOne({ intentId, gateway: "stripe" });
      if (payment && payment.status === "succeeded") {
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = "held";
          await order.save();
        }
      }
    }
    res.json({ received: true });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};
