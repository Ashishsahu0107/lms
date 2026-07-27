// app/api/auth/register/route.ts
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new student account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { signToken } from "@/lib/auth";
import { BadRequestError, ConflictError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body ?? {};

    if (!name || !email || !password) {
      throw new BadRequestError("Name, email, and password are required");
    }

    if (role && role !== "student") {
      throw new BadRequestError("Self-registration is only allowed for student accounts");
    }

    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "student",
        isVerified: true, // Auto-verify (OTP optional)
        isEmailVerified: true,
        status: "active",
        isActive: true,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Log security event
    prisma.securityLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        details: `New student registration: ${user.email}`,
        ip: req.headers.get("x-forwarded-for") || "",
        device: req.headers.get("user-agent") || "",
        severity: "low",
      },
    }).catch(console.error);

    const { password: _pw, ...safeUser } = user;

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: { token, user: safeUser },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
