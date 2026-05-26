import { apiGet } from "./apiClient";

export async function globalSearch(query) {
  return apiGet("/search/global", { query });
}
