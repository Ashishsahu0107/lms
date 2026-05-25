import { apiGet } from "./apiClient";

export async function getAdminStats() {
  return apiGet("/dashboard/admin/stats");
}

export async function getAdminAnalytics() {
  return apiGet("/dashboard/admin/analytics");
}

export async function getTeacherStats() {
  return apiGet("/dashboard/teacher/stats");
}

export async function getTeacherAnalytics() {
  return apiGet("/dashboard/teacher/analytics");
}

export async function getStudentStats() {
  return apiGet("/dashboard/student/stats");
}

export async function getStudentProgress() {
  return apiGet("/dashboard/student/progress");
}
