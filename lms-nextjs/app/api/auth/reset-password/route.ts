// app/api/auth/reset-password/route.ts
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using verified OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { BadRequestError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      throw new BadRequestError("Email, OTP, and new password are required");
    }
    if (newPassword.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new BadRequestError("User not found");

    const now = new Date();
    const isValid =
      (user.resetOTP === otp &&
        user.resetOTPExpire &&
        now <= user.resetOTPExpire) ||
      (user.resetPasswordOTP === otp &&
        user.resetPasswordOTPExpires &&
        now <= user.resetPasswordOTPExpires);

    if (!isValid) throw new BadRequestError("Invalid or expired OTP");

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetPasswordOTP: null,
        resetPasswordOTPExpires: null,
        resetOTP: null,
        resetOTPExpire: null,
        isEmailVerified: true,
        isVerified: true,
        passwordChangedAt: new Date(),
      },
    });

    prisma.securityLog
      .create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET",
          details: `Password reset for ${user.email}`,
          severity: "medium",
        },
      })
      .catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now log in.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Reset failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
