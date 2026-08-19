// app/api/auth/forgot-password/route.ts
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to email for password reset
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";
import { BadRequestError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) throw new BadRequestError("Email is required");

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new BadRequestError("User account not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOTP: otp,
        resetPasswordOTPExpires: expires,
        resetOTP: otp,
        resetOTPExpire: expires,
      },
    });

    await sendOtpEmail(user.email, otp, "Password Recovery OTP Code");

    return NextResponse.json({
      success: true,
      message: "Password reset OTP has been sent to your email.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
