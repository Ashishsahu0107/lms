import { apiRequest } from "./apiClient";

export async function login(payload) {
  // TODO: wire to backend.
  return apiRequest("/api/auth/login", { method: "POST", body: payload });
}

export async function logout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

