import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize, checkModuleOwnership } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { moduleId, topicIds } = await req.json();
    if (
      typeof moduleId !== "string" ||
      !Array.isArray(topicIds) ||
      !topicIds.every((id: unknown) => typeof id === "string") ||
      new Set(topicIds).size !== topicIds.length
    ) {
      return NextResponse.json(
        { success: false, message: "moduleId and a unique topicIds array are required" },
        { status: 400 },
      );
    }

    const ownerError = await checkModuleOwnership(user!, moduleId);
    if (ownerError) return ownerError;

    const currentTopics = await mongo.topic.find({
      filter: { moduleId },
      select: { id: true },
    });
    const currentIds = new Set(currentTopics.map((topic: { id: string }) => topic.id));
    if (
      currentIds.size !== topicIds.length ||
      topicIds.some((id: string) => !currentIds.has(id))
    ) {
      return NextResponse.json(
        { success: false, message: "Topics must belong to the selected Class" },
        { status: 400 },
      );
    }

    await Promise.all(
      topicIds.map((id: string, order: number) =>
        mongo.topic.findOneAndUpdate({
          filter: { id, moduleId },
          data: { order },
        }),
      ),
    );

    return NextResponse.json({ success: true, message: "Topics reordered" });
  } catch (err) {
    console.error("Failed to reorder topics:", err);
    return NextResponse.json(
      { success: false, message: "Failed to reorder topics" },
      { status: 500 },
    );
  }
}
