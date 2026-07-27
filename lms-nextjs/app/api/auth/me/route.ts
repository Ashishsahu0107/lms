// app/api/auth/me/route.ts
/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { user, error } = await authenticate(req);
  if (error) return error;

  // Return full user with achievements
  const fullUser = await prisma.user.findUnique({
    where: { id: user!.id },
    include: { achievements: true },
  });

  const { password: _pw, refreshToken: _rt, ...safeUser } = fullUser as Record<string, unknown> & { password?: unknown; refreshToken?: unknown };

  return NextResponse.json({
    success: true,
    message: "Current user fetched successfully",
    data: { user: safeUser },
  });
}
