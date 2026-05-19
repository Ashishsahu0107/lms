import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

// Dashboard
export async function getDashboardStats() {
  return apiGet("/admin/dashboard/stats");
}

export async function getRevenueData(months = 12) {
  return apiGet("/admin/dashboard/revenue", { months });
}

// Teachers
export async function getTeachers(params = {}) {
  return apiGet("/admin/teachers", params);
}

export async function updateTeacher(id, data) {
  return apiPut(`/admin/teacher/${id}`, data);
}

export async function deleteTeacher(id) {
  return apiDelete(`/admin/teacher/${id}`);
}

// Students
export async function getStudents(params = {}) {
  return apiGet("/admin/students", params);
}

export async function updateStudent(id, data) {
  return apiPut(`/admin/student/${id}`, data);
}

export async function deleteStudent(id) {
  return apiDelete(`/admin/student/${id}`);
}

// Courses
export async function getCourses(params = {}) {
  return apiGet("/admin/courses", params);
}

export async function updateCourse(id, data) {
  return apiPut(`/admin/course/${id}`, data);
}

export async function deleteCourse(id) {
  return apiDelete(`/admin/course/${id}`);
}

// Payments
export async function getPayments(params = {}) {
  return apiGet("/admin/payments", params);
}

// Reports
export async function getReportData(type = "overview") {
  return apiGet("/admin/reports", { type });
}

// Notifications
export async function getNotifications() {
  return apiGet("/admin/notifications");
}

// Settings
export async function getSettings() {
  return apiGet("/admin/settings");
}

export async function updateSettings(data) {
  return apiPut("/admin/settings", data);
}

// Audit Logs
export async function getAuditLogs(params = {}) {
  return apiGet("/admin/audit-logs", params);
}