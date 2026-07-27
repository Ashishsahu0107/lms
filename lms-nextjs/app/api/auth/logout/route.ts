// app/api/auth/logout/route.ts
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
import { NextResponse } from "next/server";

export async function POST() {
  // JWT is stateless — client removes the token
  return NextResponse.json({ success: true, message: "Logout successful" });
}
