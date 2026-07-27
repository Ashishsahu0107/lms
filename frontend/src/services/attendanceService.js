import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

// ── Teacher Attendance Services ───────────────────────────────────────────────

/**
 * Get enrolled students with attendance status for a course + date
 * GET /api/attendance/course/:courseId/students?date=YYYY-MM-DD
 */
export const getCourseAttendanceStudents = (courseId, date) =>
  apiGet(`/attendance/course/${courseId}/students`, { date });

/**
 * Save daily attendance register for a course
 * POST /api/attendance/mark-daily
 */
export const markDailyAttendance = (data) =>
  apiPost("/attendance/mark-daily", data);

/**
 * Update a single attendance record
 * PUT /api/attendance/update/:attendanceId
 */
export const updateAttendanceRecord = (attendanceId, data) =>
  apiPut(`/attendance/update/${attendanceId}`, data);

/**
 * Get paginated attendance history for a course
 * GET /api/attendance/history/:courseId?from=&to=&page=&limit=
 */
export const getAttendanceHistory = (courseId, params = {}) =>
  apiGet(`/attendance/history/${courseId}`, params);

/**
 * Get attendance for a specific date
 * GET /api/attendance/date/:date?courseId=
 */
export const getAttendanceByDate = (date, courseId = "") =>
  apiGet(`/attendance/date/${date}`, courseId ? { courseId } : {});

/**
 * Get attendance stats for teacher dashboard
 * GET /api/attendance/stats
 */
export const getAttendanceStats = () => apiGet("/attendance/stats");

// ── Student Attendance Services ───────────────────────────────────────────────

/**
 * Get student's own attendance records
 * GET /api/student/attendance?courseId=&from=&to=
 */
export const getMyAttendance = (params = {}) =>
  apiGet("/student/attendance", params);

/**
 * Get student's monthly attendance calendar
 * GET /api/student/attendance/calendar?courseId=&month=YYYY-MM
 */
export const getMyAttendanceCalendar = (params = {}) =>
  apiGet("/student/attendance/calendar", params);

/**
 * Get student's per-course attendance percentages
 * GET /api/student/attendance/percentage
 */
export const getMyAttendancePercentage = () =>
  apiGet("/student/attendance/percentage");

// ── Admin Attendance Services ─────────────────────────────────────────────────

/**
 * Get system-wide attendance analytics
 * GET /api/admin/attendance/analytics
 */
export const getAdminAttendanceAnalytics = () =>
  apiGet("/admin/attendance/analytics");

/**
 * Get filterable attendance reports
 * GET /api/admin/attendance/reports?courseId=&from=&to=&status=&page=
 */
export const getAdminAttendanceReports = (params = {}) =>
  apiGet("/admin/attendance/reports", params);

// ── Attendance Session Services ───────────────────────────────────────────────

/**
 * Create a new attendance session for a course
 * POST /api/attendance/sessions
 */
export const createAttendanceSession = (data) =>
  apiPost("/attendance/sessions", data);

/**
 * Get all attendance sessions for a course
 * GET /api/attendance/course/:courseId/sessions
 */
export const getCourseAttendanceSessions = (courseId) =>
  apiGet(`/attendance/course/${courseId}/sessions`);

/**
 * Delete an attendance session
 * DELETE /api/attendance/session/:sessionId
 */
export const deleteAttendanceSession = (sessionId) =>
  apiDelete(`/attendance/session/${sessionId}`);
