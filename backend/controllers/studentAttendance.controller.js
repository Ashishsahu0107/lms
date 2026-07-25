import { Attendance } from "../models/Attendance.js";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import mongoose from "mongoose";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  present: "#10b981",
  absent: "#f43f5e",
  late: "#f59e0b",
  leave: "#3b82f6",
};

function toUTCDate(str) {
  const d = new Date(str);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ======================================================
// GET /api/student/attendance?courseId=&from=&to=
// Student's own attendance records (optionally filtered)
// ======================================================
export async function getMyAttendanceController(req, res, next) {
  try {
    const studentId = req.user._id;
    const { courseId, from, to } = req.query;

    const query = { studentId };

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      query.courseId = courseId;
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = toUTCDate(from);
      if (to) {
        const toDate = toUTCDate(to);
        toDate.setUTCHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    const records = await Attendance.find(query)
      .populate("courseId", "title thumbnail category")
      .populate("teacherId", "name")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: records,
      meta: { count: records.length },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/student/attendance/calendar?courseId=&month=YYYY-MM
// Monthly calendar attendance grouped by date
// ======================================================
export async function getMyAttendanceCalendarController(req, res, next) {
  try {
    const studentId = req.user._id;
    const { courseId, month } = req.query;

    // Default to current month
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const [year, monthNum] = targetMonth.split("-").map(Number);
    const startOfMonth = new Date(Date.UTC(year, monthNum - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    const query = {
      studentId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      query.courseId = courseId;
    }

    const records = await Attendance.find(query)
      .populate("courseId", "title")
      .sort({ date: 1 });

    // Group by date string
    const calendarMap = {};
    records.forEach((r) => {
      const dateKey = r.date.toISOString().split("T")[0];
      if (!calendarMap[dateKey]) calendarMap[dateKey] = [];
      calendarMap[dateKey].push({
        courseId: r.courseId?._id,
        courseTitle: r.courseId?.title || "Course",
        status: r.status,
        remarks: r.remarks,
        color: STATUS_COLORS[r.status],
      });
    });

    // Get enrolled courses for the dropdown
    const enrollments = await Enrollment.find({ studentId }).populate(
      "courseId",
      "title",
    );
    const courses = enrollments
      .filter((e) => e.courseId)
      .map((e) => ({ id: e.courseId._id, title: e.courseId.title }));

    return res.status(200).json({
      success: true,
      data: calendarMap,
      courses,
      meta: { month: targetMonth, totalDays: Object.keys(calendarMap).length },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/student/attendance/percentage
// Per-course attendance percentage for student
// ======================================================
export async function getMyAttendancePercentageController(req, res, next) {
  try {
    const studentId = req.user._id;

    // Get all enrolled courses
    const enrollments = await Enrollment.find({ studentId }).populate(
      "courseId",
      "title thumbnail category",
    );

    const results = await Promise.all(
      enrollments
        .filter((e) => e.courseId)
        .map(async (e) => {
          const courseId = e.courseId._id;

          const records = await Attendance.find({ studentId, courseId });
          const total = records.length;
          const counts = { present: 0, absent: 0, late: 0, leave: 0 };
          records.forEach((r) => counts[r.status]++);

          const attended = counts.present + counts.late;
          const percentage =
            total > 0 ? Math.round((attended / total) * 100) : null;

          return {
            courseId: courseId.toString(),
            courseTitle: e.courseId.title,
            thumbnail: e.courseId.thumbnail || "",
            category: e.courseId.category || "",
            totalClasses: total,
            attended,
            absent: counts.absent,
            late: counts.late,
            leave: counts.leave,
            percentage,
            status:
              percentage === null
                ? "no-data"
                : percentage >= 75
                  ? "safe"
                  : percentage >= 60
                    ? "warning"
                    : "danger",
          };
        }),
    );

    // Sort: danger first, then warning, then safe
    const statusOrder = { danger: 0, warning: 1, safe: 2, "no-data": 3 };
    results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return res.status(200).json({
      success: true,
      data: results,
      meta: {
        totalCourses: results.length,
        belowThreshold: results.filter((r) => r.status === "danger").length,
        overallAvg:
          results.filter((r) => r.percentage !== null).length > 0
            ? Math.round(
                results
                  .filter((r) => r.percentage !== null)
                  .reduce((acc, r) => acc + r.percentage, 0) /
                  results.filter((r) => r.percentage !== null).length,
              )
            : null,
      },
    });
  } catch (err) {
    next(err);
  }
}
