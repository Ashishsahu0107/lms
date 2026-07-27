// app/api/modules/[id]/route.ts — Get, Update, Delete module
/**
 * @swagger
 * /modules/{id}:
 *   get:
 *     tags: [Modules]
 *     summary: Get a module
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Module data
 *   put:
 *     tags: [Modules]
 *     summary: Update a module
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       200:
 *         description: Module updated
 *   delete:
 *     tags: [Modules]
 *     summary: Delete a module
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Module deleted
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate } from "@/lib/middleware";
import { checkModuleOwnership } from "@/lib/middleware";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const module = await prisma.module.findUnique({
      where: { id },
      include: { topics: { orderBy: { createdAt: "asc" }, include: { resources: true } } },
    });
    if (!module) return NextResponse.json({ success: false, message: "Module not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { module } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch module" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const { id } = await params;
    const ownerErr = await checkModuleOwnership(user!, id);
    if (ownerErr) return ownerErr;

    const { title, order } = await req.json();
    const module = await prisma.module.update({
      where: { id },
      data: { ...(title && { title }), ...(order !== undefined && { order }) },
    });
    return NextResponse.json({ success: true, message: "Module updated", data: { module } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update module";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const message = err instanceof Error ? err.message : "Failed to delete module";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
