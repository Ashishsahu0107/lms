// app/api/admin/contact/route.ts — Admin Endpoint for Listing Contact Submissions
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "super_admin");
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [requests, total] = await Promise.all([
      prisma.contactRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Contact requests fetched successfully.",
      data: {
        requests,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact requests:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve contact requests." },
      { status: 500 },
    );
  }
}
