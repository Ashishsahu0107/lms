// app/api/modules/[id]/route.ts — Get, Update, Delete module
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, checkModuleOwnership } from "@/lib/middleware";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const moduleItem = await prisma.module.findUnique({
      where: { id },
      include: {
        topics: { orderBy: { createdAt: "asc" }, include: { resources: true } },
      },
    });
    if (!moduleItem)
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: { module: moduleItem } });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch module" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const { id } = await params;
    const ownerErr = await checkModuleOwnership(user!, id);
    if (ownerErr) return ownerErr;

    const { title, order } = await req.json();
    const updatedModule = await prisma.module.update({
      where: { id },
      data: { ...(title && { title }), ...(order !== undefined && { order }) },
    });
    return NextResponse.json({
      success: true,
      message: "Module updated",
      data: { module: updatedModule },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update module";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const { id } = await params;
    const ownerErr = await checkModuleOwnership(user!, id);
    if (ownerErr) return ownerErr;

    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Module deleted" });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete module";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
