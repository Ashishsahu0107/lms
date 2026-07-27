// lib/mailer.ts — Nodemailer email utilities (ported from backend/utils/mailer.js)
import nodemailer from "nodemailer";

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // No SMTP configured — fall back to console logging
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  subject: string
): Promise<void> {
  const transporter = getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">🎓 LMS Pro</h1>
      </div>
      <h2 style="color: #1f2937;">${subject}</h2>
      <p style="color: #6b7280;">Your one-time verification code is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="background: #f3f4f6; color: #1f2937; font-size: 42px; font-weight: bold; letter-spacing: 12px; padding: 16px 32px; border-radius: 8px; font-family: monospace;">
          ${otp}
        </span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} LMS Pro. All rights reserved.</p>
    </div>
  `;

  if (!transporter) {
    // Dev fallback — print to console
    console.log(`\n📧 [EMAIL] To: ${to} | Subject: ${subject} | OTP: ${otp}\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@lmspro.edu",
    to,
    subject,
    html,
  });
}
