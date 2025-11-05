import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendForgotPasswordEmail = async (
  email: string,
  resetToken: string,
  userType: "buyer" | "seller" = "buyer"
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&type=${userType}`;

  const mailOptions = {
    from: `"Yogreet Spices" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔐 Reset Your Password - Yogreet Spices`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background-color: #f8f9fa;
          }
          .email-wrapper {
            background-color: #f8f9fa;
            padding: 20px 0;
            min-height: 100vh;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #6b8e6b 0%, #8faf8f 100%);
            color: white; 
            padding: 40px 30px 30px;
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: white;
            border-radius: 20px 20px 0 0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 300;
          }
          .content { 
            padding: 40px 30px;
            background-color: white;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #5a6c7d;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          .reset-button { 
            display: inline-block; 
            padding: 16px 32px; 
            background: linear-gradient(135deg, #6b8e6b, #8faf8f);
            color: white !important; 
            text-decoration: none; 
            border-radius: 30px; 
            margin: 25px 0;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(107, 142, 107, 0.3);
          }
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(107, 142, 107, 0.4);
          }
          .security-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          .footer { 
            text-align: center; 
            padding: 30px;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
          }
          .footer-text {
            color: #7f8c8d;
            font-size: 13px;
            line-height: 1.5;
          }
          .company-name {
            color: #6b8e6b;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Yogreet Spices</div>
              <div class="subtitle">Pure, Premium, Authentic</div>
            </div>
            
            <div class="content">
              <div class="greeting">Hello there! 👋</div>
              
              <div class="message">
                We received a request to reset the password for your Yogreet Spices ${userType} account. Don't worry, we've got you covered!
              </div>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">
                  🔐 Reset My Password
                </a>
              </div>
              
              <div class="security-note">
                <div style="font-size: 24px; margin-bottom: 10px;">⏰</div>
                <div style="font-weight: 600; color: #f39c12; font-size: 15px;">This link expires in 1 hour</div>
                <div style="font-size: 13px; color: #6c757d; margin-top: 8px;">
                  For your security, please use this link soon
                </div>
              </div>
              
              <div style="font-size: 14px; color: #7f8c8d; font-style: italic; margin-top: 25px;">
                If you didn't request this password reset, you can safely ignore this email. Your account remains secure! 🔒
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                With warm regards,<br>
                <span class="company-name">The Yogreet Spices Team</span>
              </div>
              <div style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
                © 2024 Yogreet Spices. Made with ❤️ for our community
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendBuyerForgotPasswordEmail = async (
  email: string,
  resetToken: string
) => {
  return sendForgotPasswordEmail(email, resetToken, "buyer");
};

export const sendSellerForgotPasswordEmail = async (
  email: string,
  resetToken: string
) => {
  return sendForgotPasswordEmail(email, resetToken, "seller");
};

