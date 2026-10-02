// app/api/modules/[id]/route.ts — Get, Update, Delete module
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import {
  authenticate,
  authorize,
  checkModuleOwnership,
} from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id } = await params;
    const ownerError = await checkModuleOwnership(user!, id);
    if (ownerError) return ownerError;

    const moduleItem = await mongo.module.findOne({
      filter: { id },
      populate: { topics: { orderBy: { order: "asc", createdAt: "asc" }, populate: { resources: true } } },
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
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;
    const { id } = await params;
    const ownerErr = await checkModuleOwnership(user!, id);
    if (ownerErr) return ownerErr;

    const { title, order } = await req.json();
    const updatedModule = await mongo.module.findOneAndUpdate({
      filter: { id },
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
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;
    const { id } = await params;
    const ownerErr = await checkModuleOwnership(user!, id);
    if (ownerErr) return ownerErr;

    const topics = await mongo.topic.find({
      filter: { moduleId: id },
      select: { id: true },
    });
    const topicIds = topics.map((topic: { id: string }) => topic.id);
    if (topicIds.length) {
      await mongo.topicResource.deleteMany({ filter: { topicId: { in: topicIds } } });
    }
    await mongo.topic.deleteMany({ filter: { moduleId: id } });
    await mongo.module.findOneAndDelete({ filter: { id } });
    return NextResponse.json({ success: true, message: "Module deleted" });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete module";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
