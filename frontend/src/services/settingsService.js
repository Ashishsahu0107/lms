import { apiGet, apiPut } from "./apiClient";

export async function getProfile() {
  return apiGet("/settings/profile");
}

export async function updateProfile(data) {
  return apiPut("/settings/profile", data);
}

export async function updatePassword(data) {
  return apiPut("/settings/password", data);
}

export async function updatePreferences(data) {
  return apiPut("/settings/preferences", data);
}
