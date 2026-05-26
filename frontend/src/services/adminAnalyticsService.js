import { apiGet } from "./apiClient";

/**
 * Enterprise Admin Analytics API Services
 */

// 1. Platform Overview Stats
export async function getOverviewAnalytics() {
  return apiGet("/admin/analytics/overview");
}

// 2. User Engagement and Growth
export async function getUserAnalytics(params = {}) {
  return apiGet("/admin/analytics/users", params);
}

// 3. Course enrollments and progress funnels
export async function getCourseAnalytics(params = {}) {
  return apiGet("/admin/analytics/courses", params);
}

// 4. Financial dashboards and subscription plans
export async function getRevenueAnalytics(params = {}) {
  return apiGet("/admin/analytics/revenue", params);
}

// 5. Quiz scores and student grade rankings
export async function getPerformanceAnalytics(params = {}) {
  return apiGet("/admin/analytics/performance", params);
}

// 6. Attendance records and daily attendance curves
export async function getAttendanceAnalytics(params = {}) {
  return apiGet("/admin/analytics/attendance", params);
}

// 7. Live socket connection online totals
export async function getRealtimeAnalytics() {
  return apiGet("/admin/analytics/realtime");
}
