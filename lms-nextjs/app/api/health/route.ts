// app/api/health/route.ts — Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: API health check
 *     security: []
 *     responses:
 *       200:
 *         description: Server running successfully
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "LMS Pro API Running Successfully",
    version: "3.0.0",
    stack: "Next.js 15 + PostgreSQL (Prisma) + Socket.io",
    timestamp: new Date().toISOString(),
  });
}
