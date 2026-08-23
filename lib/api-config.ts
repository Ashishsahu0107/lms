// lib/api-config.ts — Centralized API and Socket URL resolver
// Ensures production safety: never falls back to localhost in production/browser environments.

/**
 * Resolves the base API URL.
 * - If NEXT_PUBLIC_API_URL is set (e.g. "https://api.example.com/api" or "/api"), uses it.
 * - In browser / Vercel deployment: defaults to "/api" (relative same-origin request).
 * - On server-side without env: defaults to "http://localhost:3000/api".
 */
export const API_URL: string = (
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:3000/api")
).replace(/\/$/, "");

/**
 * Resolves the Socket.IO server URL.
 * - In production: Must be set via NEXT_PUBLIC_SOCKET_URL (e.g. "https://socket.lmspro.edu" or Render/Railway URL).
 * - In development / local: Defaults to window.location.origin in browser or "http://localhost:3000".
 */
export const SOCKET_URL: string =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? window.location.origin
    : "");

/**
 * Helper to build an absolute or relative endpoint path cleanly.
 */
export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}

