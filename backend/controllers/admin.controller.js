import { adminService } from "../services/admin.service.js";
import { BadRequestError } from "../utils/errors.js";

// ─── Dashboard ──────────────────────────────────────────────────────────────
export async function getDashboardStatsController(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getRevenueDataController(req, res, next) {
  try {
    const { months } = req.query;
    const data = await adminService.getRevenueData(parseInt(months) || 12);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ─── Teachers ────────────────────────────────────────────────────────────────
export async function getTeachersController(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminService.getTeachers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search,
      status,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateTeacherController(req, res, next) {
  try {
    const { id } = req.params;
    const teacher = await adminService.updateTeacher(id, req.body);
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

export async function deleteTeacherController(req, res, next) {
  try {
    const { id } = req.params;
    await adminService.deleteTeacher(id);
    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// ─── Students ─────────────────────────────────────────────────────────────────
export async function getStudentsController(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminService.getStudents({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search,
      status,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateStudentController(req, res, next) {
  try {
    const { id } = req.params;
    const student = await adminService.updateStudent(id, req.body);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

export async function deleteStudentController(req, res, next) {
  try {
    const { id } = req.params;
    await adminService.deleteStudent(id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export async function getCoursesController(req, res, next) {
  try {
    const { page, limit, search, status, category } = req.query;
    const result = await adminService.getCourses({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search,
      status,
      category,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateCourseController(req, res, next) {
  try {
    const { id } = req.params;
    const course = await adminService.updateCourse(id, req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

export async function deleteCourseController(req, res, next) {
  try {
    const { id } = req.params;
    await adminService.deleteCourse(id);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export async function getPaymentsController(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminService.getPayments({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      status,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export async function getReportDataController(req, res, next) {
  try {
    const { type } = req.query;
    const data = await adminService.getReportData(type);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export async function getNotificationsController(req, res, next) {
  try {
    const notifications = await adminService.getNotifications();
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSettingsController(req, res, next) {
  try {
    const settings = await adminService.getSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettingsController(req, res, next) {
  try {
    const settings = await adminService.updateSettings(req.body);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────
export async function getAuditLogsController(req, res, next) {
  try {
    const { page, limit, userId, action } = req.query;
    const result = await adminService.getAuditLogs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      userId,
      action,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
