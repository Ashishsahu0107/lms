import { apiRequest } from "./apiClient";

export async function getMe() {
  return apiRequest("/api/users/me");
}

