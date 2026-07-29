// app/api/auth/login/route.ts
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { signToken } from "@/lib/auth";
import { BadRequestError, UnauthorizedError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Log security event (non-blocking)
      prisma.securityLog
        .create({
          data: {
            action: "FAILED_LOGIN",
            details: `Failed login attempt: user with email ${email} not found`,
            ip: req.headers.get("x-forwarded-for") || "",
            device: req.headers.get("user-agent") || "",
            severity: "medium",
          },
        })
        .catch(console.error);

      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      prisma.securityLog
        .create({
          data: {
            userId: user.id,
            action: "FAILED_LOGIN",
            details: `Failed login attempt: incorrect password for ${email}`,
            ip: req.headers.get("x-forwarded-for") || "",
            device: req.headers.get("user-agent") || "",
            severity: "medium",
          },
        })
        .catch(console.error);

      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive || user.status !== "active") {
      throw new UnauthorizedError("Your account has been suspended");
    }

    // Update streak for students
    if (user.role === "student") {
      const today = new Date().toDateString();
      const lastActive = user.lastActiveDate
        ? new Date(user.lastActiveDate).toDateString()
        : null;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = lastActive === yesterday.toDateString();

        prisma.user
          .update({
            where: { id: user.id },
            data: {
              streak: wasYesterday ? user.streak + 1 : 1,
              lastActiveDate: new Date(),
            },
          })
          .catch(console.error);
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log successful login
    prisma.securityLog
      .create({
        data: {
          userId: user.id,
          action: "USER_LOGIN",
          details: `Successful login: ${user.email}`,
          ip: req.headers.get("x-forwarded-for") || "",
          device: req.headers.get("user-agent") || "",
          severity: "low",
        },
      })
      .catch(console.error);

    const { password: _pw, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: { token, user: safeUser },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
