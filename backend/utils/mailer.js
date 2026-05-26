import nodemailer from "nodemailer";

// Simple fallback logger if SMTP transporter fails or credentials are unset
function logOtpToConsole(email, otp, subject) {
  console.log("==========================================");
  console.log(`[SMTP SIMULATOR] - EMAIL SENT TO: ${email}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`YOUR SECURITY OTP: ${otp}`);
  console.log("==========================================");
}

export async function sendOtpEmail(email, otp, subject = "LMS Pro Security Verification") {
  try {
    // 1. Create a transporter using Ethereal or standard SMTP settings
    // In production, these variables would come from process.env (or Settings DB)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "fake-smtp-username",
        pass: process.env.SMTP_PASS || "fake-smtp-password",
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"LMS Pro Admin" <noreply@lmspro.edu>',
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-lg: 12px; background-color: #ffffff;">
          <h2 style="color: #3b82f6; text-align: center;">LMS Pro Security Portal</h2>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 16px; color: #374151;">Hello,</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">You requested a security action on your LMS Pro account. Please use the following 6-digit One-Time Password (OTP) to complete the verification:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; color: #1e3a8a;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #6b7280; text-align: center;">This OTP is valid for <strong>15 minutes</strong>. If you did not make this request, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">LMS Pro Inc., c/o Security Division.</p>
        </div>
      `,
    };

    // If SMTP host settings are mocked or empty, skip sending and log directly
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes("ethereal")) {
      logOtpToConsole(email, otp, subject);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Mail dispatched: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error("Mailer encountered error, executing console fallback:", error.message);
    logOtpToConsole(email, otp, subject);
    return { success: true, fallback: true, error: error.message };
  }
}
