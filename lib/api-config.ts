// lib/api-config.ts — Centralized API and Socket URL resolver
// Ensures production safety: never falls back to localhost in production/browser environments.

/**
 * Resolves the base API URL.
 * - If NEXT_PUBLIC_API_URL is set (e.g. "https://api.example.com/api" or "/api"), uses it.
 * - In browser / Vercel deployment: defaults to "/api" (relative same-origin request).
 * - Uses same-origin requests by default.
 */
export const API_URL: string = (() => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local");

    if (isLocal) {
      return "/api";
    }
  }

  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (!configured || configured.trim() === "") {
    return "/api";
  }

  return configured.replace(/\/$/, "");
})();

/**
 * Resolves the Socket.IO server URL.
 * - In production: Must be set via NEXT_PUBLIC_SOCKET_URL (e.g. "https://socket.lmspro.edu" or Render/Railway URL).
 * - In development: Defaults to the current origin.
 */
export const SOCKET_URL: string =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NODE_ENV !== "production" && typeof window !== "undefined"
    ? window.location.origin
    : "");

/**
 * Helper to build an absolute or relative endpoint path cleanly.
 */
export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}

