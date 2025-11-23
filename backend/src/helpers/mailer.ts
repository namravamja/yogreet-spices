import nodemailer from "nodemailer";

// Validate email configuration
const validateEmailConfig = () => {
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'BACKEND_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required email environment variables: ${missingVars.join(', ')}. ` +
      `Please check your .env file.`
    );
  }
};

// Get or create transporter (lazy initialization)
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    // Validate configuration before creating transporter
    validateEmailConfig();
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: Number(process.env.EMAIL_PORT!),
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
      secure: false, // For port 587
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  
  return transporter;
};

export const sendVerificationEmail = async (email: string, token: string, role: "BUYER" | "SELLER" = "BUYER") => {
  // Validate email format
  if (!email || !email.includes('@')) {
    throw new Error(`Invalid email address: ${email}`);
  }

  // Validate token
  if (!token || token.trim().length === 0) {
    throw new Error("Verification token is missing or invalid");
  }

  // Get transporter (will validate config and create if needed)
  let emailTransporter: nodemailer.Transporter;
  try {
    emailTransporter = getTransporter();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Email configuration is invalid";
    console.error("❌ Email configuration error:", errorMessage);
    throw new Error(`Cannot send verification email: ${errorMessage}`);
  }

  // Use backend verification endpoint which will redirect to document verification
  const backendUrl = process.env.BACKEND_URL!;
  const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

  const roleColor = role === "SELLER" ? "#6b8e6b" : "#8B6B9D"; // sage for seller, purple for buyer
  const roleName = role === "SELLER" ? "seller" : "buyer";

  const message = {
    from: `"Yogreet Spices" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Verify your ${roleName} email for Yogreet Spices`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Verify Your ${role === "SELLER" ? "Seller" : "Buyer"} Email</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Thank you for signing up as a ${roleName} on Yogreet Spices! Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="padding: 12px 30px; background: ${roleColor}; color: white; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #0066cc; font-size: 12px; word-break: break-all; margin-top: 10px;">
          ${verificationUrl}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          If you did not create a ${roleName} account, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await emailTransporter.sendMail(message);
    console.log(`✅ Verification email sent to ${email} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error sending verification email to ${email}:`, errorDetails);
    console.error("Full error:", error);
    throw new Error(`Failed to send verification email: ${errorDetails}`);
  }
};

