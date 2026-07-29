// app/api/auth/verify-reset-otp/route.ts
/**
 * @swagger
 * /auth/verify-reset-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP for password reset
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BadRequestError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) throw new BadRequestError("Email and OTP are required");

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new BadRequestError("User account not found");

    const now = new Date();
    const isValid =
      (user.resetOTP === otp &&
        user.resetOTPExpire &&
        now <= user.resetOTPExpire) ||
      (user.resetPasswordOTP === otp &&
        user.resetPasswordOTPExpires &&
        now <= user.resetPasswordOTPExpires);

    if (!isValid)
      throw new BadRequestError("Invalid or expired password recovery OTP");

    return NextResponse.json({
      success: true,
      message: "OTP verified. You can now reset your password.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
