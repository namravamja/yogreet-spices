import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

type EmailItem = {
  name: string;
  quantity: number;
  price: number;
};

type Shipping = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
};

export const sendOrderConfirmationEmail = async (
  email: string,
  fullName: string,
  orderId: string,
  items: EmailItem[],
  totalAmount: number,
  shippingAddress: Shipping,
  placedAt: string,
  paymentMethod: string
) => {
  const shortOrderId = orderId.slice(0, 8);

  const orderItemsHTML = items
    .map(
      (item) => `
      <tr>
        <td style="padding:15px 0;border-bottom:1px solid #eee;font-size:16px;color:#333;">${item.name}</td>
        <td style="padding:15px 0;border-bottom:1px solid #eee;text-align:center;font-size:16px;color:#666;">${item.quantity}</td>
        <td style="padding:15px 0;border-bottom:1px solid #eee;text-align:right;font-size:16px;font-weight:600;color:#333;">₹${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const message = {
    from: '"Yogreet Spices" <no-reply@yogreet.com>',
    to: email,
    subject: `✅ Order Confirmed #${shortOrderId} - Yogreet Spices`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin:0 auto;">
                
                <!-- Header -->
                <tr>
                  <td style="padding:40px 50px 30px;text-align:center;background-color:#6b8e6b;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:-0.5px;">🌿 Yogreet Spices</h1>
                    <p style="margin:8px 0 0;color:#d4e6d4;font-size:14px;">Pure, Premium, Authentic</p>
                  </td>
                </tr>
                
                <!-- Success Message -->
                <tr>
                  <td style="padding:40px 50px 20px;text-align:center;">
                    <div style="width:60px;height:60px;background-color:#6b8e6b;border-radius:50%;margin:0 auto 20px;position:relative;">
                      <span style="color:white;font-size:30px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">✓</span>
                    </div>
                    <h2 style="margin:0 0 10px;font-size:24px;color:#1f2937;font-weight:600;">Thank You for Your Order!</h2>
                    <p style="margin:0;font-size:16px;color:#6b7280;">Hi ${fullName}, your order has been confirmed and is being processed.</p>
                  </td>
                </tr>
                
                <!-- Order Info -->
                <tr>
                  <td style="padding:0 50px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;">
                      <tr>
                        <td style="padding:20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:14px;color:#374151;font-weight:600;">Order Id</td>
                              <td style="text-align:right;font-size:14px;color:#6b7280;">#${shortOrderId}</td>
                            </tr>
                            <tr>
                              <td style="padding-top:8px;font-size:14px;color:#374151;font-weight:600;">Order Date</td>
                              <td style="padding-top:8px;text-align:right;font-size:14px;color:#6b7280;">${new Date(placedAt).toLocaleDateString("en-IN")}</td>
                            </tr>
                            <tr>
                              <td style="padding-top:8px;font-size:14px;color:#374151;font-weight:600;">Payment Method</td>
                              <td style="padding-top:8px;text-align:right;font-size:14px;color:#6b7280;">${paymentMethod}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Items -->
                <tr>
                  <td style="padding:0 50px 30px;">
                    <h3 style="margin:0 0 20px;font-size:18px;color:#1f2937;font-weight:600;">Order Items</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <thead>
                        <tr style="background-color:#f3f4f6;">
                          <th style="padding:12px 0;text-align:left;font-size:14px;font-weight:600;color:#374151;">Product</th>
                          <th style="padding:12px 0;text-align:center;font-size:14px;font-weight:600;color:#374151;">Qty</th>
                          <th style="padding:12px 0;text-align:right;font-size:14px;font-weight:600;color:#374151;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${orderItemsHTML}
                      </tbody>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td style="padding:15px 0;border-top:2px solid #e5e7eb;text-align:right;">
                          <span style="font-size:18px;font-weight:700;color:#1f2937;">Total: ₹${totalAmount.toFixed(2)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Shipping -->
                <tr>
                  <td style="padding:0 50px 30px;">
                    <h3 style="margin:0 0 15px;font-size:18px;color:#1f2937;font-weight:600;">Shipping Address</h3>
                    <div style="background-color:#f9fafb;padding:20px;border-radius:8px;line-height:1.6;">
                      <p style="margin:0 0 5px;font-weight:600;color:#1f2937;">${shippingAddress.name}</p>
                      <p style="margin:0 0 5px;color:#4b5563;">${shippingAddress.address}</p>
                      <p style="margin:0 0 5px;color:#4b5563;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}</p>
                      <p style="margin:0 0 8px;color:#4b5563;">${shippingAddress.country}</p>
                      <p style="margin:0;color:#6b7280;font-size:14px;">Phone: ${shippingAddress.phone}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Track Button -->
                <tr>
                  <td style="padding:0 50px 40px;text-align:center;">
                    <a href="${process.env.FRONTEND_URL}/buyer/orders/${orderId}" 
                       style="display:inline-block;background-color:#6b8e6b;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;font-size:16px;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 50px;background-color:#f9fafb;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      &copy; ${new Date().getFullYear()} Yogreet Spices. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `,
  };

  await transporter.sendMail(message);
};

