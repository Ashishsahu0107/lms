// app/api/students/route.ts — Dedicated Student Roster API for Course & Assignment Assignment
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    // Authorized for Teachers and Super Admins
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: Record<string, unknown> = {
      role: "student",
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Students fetched successfully.",
      data: { students, total: students.length },
    });
  } catch (error) {
    console.error("Error fetching students list:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve student roster." },
      { status: 500 },
    );
  }
}
