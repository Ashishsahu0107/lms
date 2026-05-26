import { apiGet, apiPost, apiDelete } from "./apiClient";

export async function getCalendarEvents() {
  return apiGet("/schedules/calendar");
}

export async function createSchedule(data) {
  return apiPost("/schedules", data);
}

export async function deleteSchedule(id) {
  return apiDelete(`/schedules/${id}`);
}
