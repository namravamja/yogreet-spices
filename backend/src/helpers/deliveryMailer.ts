import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send delivery partner assigned notification to buyer
 */
export const sendDeliveryPartnerAssignedToBuyer = async (
  email: string,
  fullName: string,
  orderId: string,
  deliveryPartnerName: string
) => {
  const shortOrderId = orderId.slice(0, 8);

  const message = {
    from: '"Yogreet Spices" <no-reply@yogreet.com>',
    to: email,
    subject: `📦 Delivery Partner Assigned - Order #${shortOrderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin:0 auto;border-radius:8px;">
                
                <tr>
                  <td style="padding:40px 50px 30px;text-align:center;background-color:#6b8e6b;border-radius:8px 8px 0 0;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🌿 Yogreet Spices</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:40px 50px 20px;">
                    <h2 style="margin:0 0 20px;font-size:22px;color:#1f2937;">Delivery Partner Assigned</h2>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      Hi ${fullName},
                    </p>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      Your shipment has been assigned to our official logistics partner <strong>${deliveryPartnerName}</strong>.
                    </p>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      Order ID: <strong>#${shortOrderId}</strong>
                    </p>
                    <p style="margin:0;font-size:16px;color:#4b5563;line-height:1.6;">
                      You can track your shipment progress in real-time from your order page.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:0 50px 40px;text-align:center;">
                    <a href="${process.env.FRONTEND_URL}/buyer/orders/${orderId}" 
                       style="display:inline-block;background-color:#6b8e6b;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;font-size:16px;">
                      Track Your Shipment
                    </a>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:20px 50px;background-color:#f9fafb;text-align:center;border-radius:0 0 8px 8px;">
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

/**
 * Send delivery partner assigned notification to seller
 */
export const sendDeliveryPartnerAssignedToSeller = async (
  email: string,
  sellerName: string,
  orderId: string,
  deliveryPartnerName: string
) => {
  const shortOrderId = orderId.slice(0, 8);

  const message = {
    from: '"Yogreet Spices" <no-reply@yogreet.com>',
    to: email,
    subject: `🚚 Official Logistics Partner Assigned - Order #${shortOrderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin:0 auto;border-radius:8px;">
                
                <tr>
                  <td style="padding:40px 50px 30px;text-align:center;background-color:#6b8e6b;border-radius:8px 8px 0 0;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🌿 Yogreet Spices</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:40px 50px 20px;">
                    <h2 style="margin:0 0 20px;font-size:22px;color:#1f2937;">Pickup Scheduled</h2>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      Hi ${sellerName},
                    </p>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      Official logistics partner <strong>${deliveryPartnerName}</strong> has been assigned for pickup/export of order <strong>#${shortOrderId}</strong>.
                    </p>
                    <p style="margin:0;font-size:16px;color:#4b5563;line-height:1.6;">
                      Please ensure the package is ready for pickup.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:0 50px 40px;text-align:center;">
                    <a href="${process.env.FRONTEND_URL}/seller/orders/${orderId}" 
                       style="display:inline-block;background-color:#6b8e6b;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;font-size:16px;">
                      View Order Details
                    </a>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:20px 50px;background-color:#f9fafb;text-align:center;border-radius:0 0 8px 8px;">
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

/**
 * Send status update notification
 */
export const sendStatusUpdateEmail = async (
  email: string,
  recipientName: string,
  orderId: string,
  newStatus: string,
  recipientRole: "buyer" | "seller"
) => {
  const shortOrderId = orderId.slice(0, 8);
  
  const statusMessages: Record<string, string> = {
    picked_up: "Your package has been picked up by our delivery partner",
    in_transit: "Your package is in transit",
    out_for_delivery: "Your package is out for delivery",
    delivered: "Your package has been delivered",
  };

  const message = statusMessages[newStatus] || `Order status updated to ${newStatus}`;
  const orderUrl = recipientRole === "buyer" 
    ? `${process.env.FRONTEND_URL}/buyer/orders/${orderId}`
    : `${process.env.FRONTEND_URL}/seller/orders/${orderId}`;

  const emailMessage = {
    from: '"Yogreet Spices" <no-reply@yogreet.com>',
    to: email,
    subject: `📦 Order Update - #${shortOrderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin:0 auto;border-radius:8px;">
                
                <tr>
                  <td style="padding:40px 50px 30px;text-align:center;background-color:#6b8e6b;border-radius:8px 8px 0 0;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🌿 Yogreet Spices</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:40px 50px 20px;">
                    <h2 style="margin:0 0 20px;font-size:22px;color:#1f2937;">Order Status Update</h2>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      Hi ${recipientName},
                    </p>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      ${message}
                    </p>
                    <p style="margin:0;font-size:16px;color:#4b5563;line-height:1.6;">
                      Order ID: <strong>#${shortOrderId}</strong>
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:0 50px 40px;text-align:center;">
                    <a href="${orderUrl}" 
                       style="display:inline-block;background-color:#6b8e6b;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;font-size:16px;">
                      View Order Details
                    </a>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:20px 50px;background-color:#f9fafb;text-align:center;border-radius:0 0 8px 8px;">
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

  await transporter.sendMail(emailMessage);
};

/**
 * Send issue reported notification
 */
export const sendIssueReportedEmail = async (
  email: string,
  recipientName: string,
  orderId: string,
  issueType: string,
  issueDescription: string,
  recipientRole: "buyer" | "seller" | "admin"
) => {
  const shortOrderId = orderId.slice(0, 8);
  
  const orderUrl = recipientRole === "admin"
    ? `${process.env.FRONTEND_URL}/admin/orders/${orderId}`
    : recipientRole === "buyer"
    ? `${process.env.FRONTEND_URL}/buyer/orders/${orderId}`
    : `${process.env.FRONTEND_URL}/seller/orders/${orderId}`;

  const message = {
    from: '"Yogreet Spices" <no-reply@yogreet.com>',
    to: email,
    subject: `⚠️ Delivery Issue Reported - Order #${shortOrderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin:0 auto;border-radius:8px;">
                
                <tr>
                  <td style="padding:40px 50px 30px;text-align:center;background-color:#dc2626;border-radius:8px 8px 0 0;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🌿 Yogreet Spices</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:40px 50px 20px;">
                    <h2 style="margin:0 0 20px;font-size:22px;color:#1f2937;">Delivery Issue Reported</h2>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      Hi ${recipientName},
                    </p>
                    <p style="margin:0 0 15px;font-size:16px;color:#4b5563;line-height:1.6;">
                      An issue has been reported for order <strong>#${shortOrderId}</strong>.
                    </p>
                    <div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:15px;margin:20px 0;">
                      <p style="margin:0 0 10px;font-weight:600;color:#991b1b;">Issue Type: ${issueType.replace(/_/g, " ").toUpperCase()}</p>
                      <p style="margin:0;color:#7f1d1d;">${issueDescription}</p>
                    </div>
                    <p style="margin:0;font-size:16px;color:#4b5563;line-height:1.6;">
                      Please review the issue details and take appropriate action.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:0 50px 40px;text-align:center;">
                    <a href="${orderUrl}" 
                       style="display:inline-block;background-color:#dc2626;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;font-size:16px;">
                      View Issue Details
                    </a>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:20px 50px;background-color:#f9fafb;text-align:center;border-radius:0 0 8px 8px;">
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
