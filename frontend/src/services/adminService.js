import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

// Dashboard
export async function getDashboardStats() {
  return apiGet("/admin/dashboard/stats");
}

export async function getRevenueData(months = 12) {
  return apiGet("/admin/dashboard/revenue", { months });
}

// Teachers REST & Analytics
export async function getTeachers(params = {}) {
  return apiGet("/admin/teachers", params);
}

export async function createTeacher(data) {
  return apiPost("/admin/teachers", data);
}

export async function getTeacher(id) {
  return apiGet(`/admin/teachers/${id}`);
}

export async function updateTeacher(id, data) {
  return apiPut(`/admin/teachers/${id}`, data);
}

export async function deleteTeacher(id) {
  return apiDelete(`/admin/teachers/${id}`);
}

export async function getTeacherAnalytics() {
  return apiGet("/admin/teachers/analytics");
}

// Students REST & Analytics
export async function getStudents(params = {}) {
  return apiGet("/admin/students", params);
}

export async function createStudent(data) {
  return apiPost("/admin/students", data);
}

export async function getStudent(id) {
  return apiGet(`/admin/students/${id}`);
}

export async function updateStudent(id, data) {
  return apiPut(`/admin/students/${id}`, data);
}

export async function deleteStudent(id) {
  return apiDelete(`/admin/students/${id}`);
}

export async function getStudentAnalytics() {
  return apiGet("/admin/students/analytics");
}

// Bulk Import / Export
export async function bulkImportUsers(usersList) {
  return apiPost("/admin/users/bulk-import", { usersList });
}

export async function exportUsers() {
  // Return the raw text csv download or redirect to download path
  return apiGet("/admin/users/export");
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