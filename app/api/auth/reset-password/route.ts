// app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongo from "@/lib/db";
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

    const user = await mongo.user.findOne({
      filter: { email: email.toLowerCase() },
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

    await mongo.user.findOneAndUpdate({
      filter: { id: user.id },
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

    mongo.securityLog
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
