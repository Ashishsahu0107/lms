// app/api/search/route.ts — Global Search API
/**
 * @swagger
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Global search across courses, users, and assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [courses, users, assignments, all] }
 *     responses:
 *       200:
 *         description: Search results
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type") || "all";

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: false, message: "Search query must be at least 2 characters" }, { status: 400 });
    }

    const query = q.trim();
    const results: Record<string, unknown[]> = {};

    if (type === "all" || type === "courses") {
      results.courses = await prisma.course.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        include: { teacher: { select: { id: true, name: true } } },
      });
    }

    if ((type === "all" || type === "users") && user!.role !== "student") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: { id: true, name: true, email: true, role: true, avatar: true },
      });
    }

    if (type === "all" || type === "assignments") {
      results.assignments = await prisma.assignment.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        include: { course: { select: { id: true, title: true } } },
      });
    }

    return NextResponse.json({ success: true, data: { results, query } });
  } catch {
    return NextResponse.json({ success: false, message: "Search failed" }, { status: 500 });
  }
}
