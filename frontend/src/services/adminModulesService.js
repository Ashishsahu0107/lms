import { apiGet, apiPost, apiPut } from "./apiClient";

// Payments APIs
export async function getPayments() {
  return apiGet("/admin/payments");
}

export async function getInvoices() {
  return apiGet("/admin/invoices");
}

export async function getSubscriptions() {
  return apiGet("/admin/subscriptions");
}

export async function processRefund(paymentId, status) {
  return apiPost("/admin/payments/refund", { paymentId, status });
}

// Reports APIs (Base URLs for direct CSV triggers)
const hostname = window.location.hostname;
export const REPORTS_STUDENTS_URL = `http://${hostname}:5000/api/admin/reports/students`;
export const REPORTS_TEACHERS_URL = `http://${hostname}:5000/api/admin/reports/teachers`;
export const REPORTS_REVENUE_URL = `http://${hostname}:5000/api/admin/reports/revenue`;
export const REPORTS_COURSES_URL = `http://${hostname}:5000/api/admin/reports/courses`;

// Analytics APIs
export async function getPlatformAnalytics() {
  return apiGet("/admin/analytics/platform");
}

export async function getUserAnalytics() {
  return apiGet("/admin/analytics/users");
}

export async function getCourseAnalytics() {
  return apiGet("/admin/analytics/courses");
}

export async function getQuizAnalytics() {
  return apiGet("/admin/analytics/quizzes");
}

// Notifications APIs
export async function getNotifications() {
  return apiGet("/admin/notifications");
}

export async function sendNotification(data) {
  return apiPost("/admin/notifications/send", data);
}

// Security APIs
export async function getSecurityLogs() {
  return apiGet("/admin/security/logs");
}

export async function getSessions() {
  return apiGet("/admin/security/sessions");
}

// Settings APIs
export async function getSettings() {
  return apiGet("/admin/settings");
}

export async function updateSettings(data) {
  return apiPut("/admin/settings/update", data);
}
