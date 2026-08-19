// app/api/docs/route.ts — Swagger UI endpoint
/**
 * @swagger
 * /docs:
 *   get:
 *     tags: [Health]
 *     summary: Interactive API documentation
 *     description: Swagger UI for LMS Pro API
 *     security: []
 */
import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
