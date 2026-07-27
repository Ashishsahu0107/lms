// lib/auth.ts — JWT helpers for Next.js API Route Handlers
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Sign a JWT token
export function signToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify a JWT token
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

// Extract token from request Authorization header
export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.split(" ")[1];
}

// Get authenticated user from request
export async function getAuthUser(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        isActive: true,
        isVerified: true,
        preferences: true,
        xp: true,
        streak: true,
        badges: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;
