// lib/middleware.ts — RBAC middleware helpers for Next.js Route Handlers
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, type AuthUser } from "@/lib/auth";
import prisma from "@/lib/db";

type Role = "student" | "teacher" | "super_admin";

// ============================================================
// AUTHENTICATE — require a valid JWT, returns user or 401
// ============================================================
export async function authenticate(req: NextRequest): Promise<
  | { user: AuthUser; error: null }
  | { user: null; error: NextResponse }
> {
  const user = await getAuthUser(req);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Authentication token missing or invalid" },
        { status: 401 }
      ),
    };
  }

  if (user.isActive === false || String(user.status).toLowerCase() === "suspended") {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Your account has been suspended" },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

// ============================================================
// AUTHORIZE — restrict to specific roles
// ============================================================
export function authorize(user: AuthUser, ...roles: Role[]): NextResponse | null {
  if (!roles.includes(user.role as Role)) {
    return NextResponse.json(
      { success: false, message: "Access denied: insufficient permissions" },
      { status: 403 }
    );
  }
  return null;
}

// ============================================================
// COURSE OWNERSHIP GUARD
// ============================================================
export async function checkCourseOwnership(
  user: AuthUser,
  courseId: string
): Promise<NextResponse | null> {
  if (user.role === "super_admin") return null;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true },
  });

  if (!course) {
    return NextResponse.json(
      { success: false, message: "Course not found" },
      { status: 404 }
    );
  }

  if (course.teacherId !== user.id) {
    return NextResponse.json(
      { success: false, message: "Access denied: you do not own this course" },
      { status: 403 }
    );
  }

  return null;
}

// ============================================================
// MODULE OWNERSHIP GUARD
// ============================================================
export async function checkModuleOwnership(
  user: AuthUser,
  moduleId: string
): Promise<NextResponse | null> {
  if (user.role === "super_admin") return null;

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { teacherId: true } } },
  });

  if (!mod) {
    return NextResponse.json(
      { success: false, message: "Module not found" },
      { status: 404 }
    );
  }

  if (mod.course.teacherId !== user.id) {
    return NextResponse.json(
      { success: false, message: "Access denied: you do not own this module's course" },
      { status: 403 }
    );
  }

  return null;
}

// ============================================================
// TOPIC OWNERSHIP GUARD
// ============================================================
export async function checkTopicOwnership(
  user: AuthUser,
  topicId: string
): Promise<NextResponse | null> {
  if (user.role === "super_admin") return null;

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      module: {
        include: { course: { select: { teacherId: true } } },
      },
    },
  });

  if (!topic) {
    return NextResponse.json(
      { success: false, message: "Topic not found" },
      { status: 404 }
    );
  }

  if (topic.module.course.teacherId !== user.id) {
    return NextResponse.json(
      { success: false, message: "Access denied: you do not own this topic's course" },
      { status: 403 }
    );
  }

  return null;
}

// ============================================================
// HELPER — create standard API handler with auth
// ============================================================
export function withAuth(
  handler: (req: NextRequest, user: AuthUser, params?: Record<string, string>) => Promise<NextResponse>,
  ...requiredRoles: Role[]
) {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      const { user, error } = await authenticate(req);
      if (error) return error;

      if (requiredRoles.length > 0) {
        const roleError = authorize(user!, ...requiredRoles);
        if (roleError) return roleError;
      }

      return await handler(req, user!, context?.params);
    } catch (err: unknown) {
      console.error("[API Error]", err);
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return NextResponse.json({ success: false, message }, { status });
    }
  };
}
