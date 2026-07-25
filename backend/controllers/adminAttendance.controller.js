import { Attendance } from "../models/Attendance.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Enrollment } from "../models/Enrollment.js";

function toUTCDate(str) {
  const d = new Date(str);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ======================================================
// GET /api/admin/attendance/analytics
// System-wide attendance analytics
// ======================================================
export async function getAdminAttendanceAnalyticsController(req, res, next) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalRecords, recentRecords, totalCourses, totalStudents] =
      await Promise.all([
        Attendance.countDocuments(),
        Attendance.find({ date: { $gte: thirtyDaysAgo } }),
        Course.countDocuments(),
        User.countDocuments({ role: "student" }),
      ]);

    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    recentRecords.forEach((r) => counts[r.status]++);
    const recentTotal = recentRecords.length;

    // Daily trend for last 14 days
    const dailyMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = {
        date: key,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
      };
    }
    recentRecords.forEach((r) => {
      const key = r.date.toISOString().split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key][r.status]++;
        dailyMap[key].total++;
      }
    });
    const dailyTrend = Object.values(dailyMap).map((d) => ({
      ...d,
      rate:
        d.total > 0 ? Math.round(((d.present + d.late) / d.total) * 100) : 0,
    }));

    // Course-wise attendance rates
    const courses = await Course.find().select("_id title").limit(10);
    const courseStats = await Promise.all(
      courses.map(async (c) => {
        const cRecords = await Attendance.find({
          courseId: c._id,
          date: { $gte: thirtyDaysAgo },
        });
        const cTotal = cRecords.length;
        const cPresent = cRecords.filter(
          (r) => r.status === "present" || r.status === "late",
        ).length;
        return {
          courseId: c._id,
          title: c.title,
          total: cTotal,
          rate: cTotal > 0 ? Math.round((cPresent / cTotal) * 100) : 0,
        };
      }),
    );
    courseStats.sort((a, b) => b.rate - a.rate);

    // Low attendance students (< 60%)
    const enrollments = await Enrollment.find()
      .populate("studentId", "name email")
      .populate("courseId", "title");
    const studentAttendance = {};
    recentRecords.forEach((r) => {
      const key = `${r.studentId}-${r.courseId}`;
      if (!studentAttendance[key]) {
        studentAttendance[key] = {
          studentId: r.studentId,
          courseId: r.courseId,
          total: 0,
          present: 0,
        };
      }
      studentAttendance[key].total++;
      if (r.status === "present" || r.status === "late")
        studentAttendance[key].present++;
    });

    const lowAttendanceAlerts = Object.values(studentAttendance)
      .filter((s) => s.total >= 5 && s.present / s.total < 0.6)
      .map((s) => {
        const enrollment = enrollments.find(
          (e) =>
            e.studentId?._id?.toString() === s.studentId?.toString() &&
            e.courseId?._id?.toString() === s.courseId?.toString(),
        );
        return {
          studentName: enrollment?.studentId?.name || "Unknown Student",
          studentEmail: enrollment?.studentId?.email || "",
          courseTitle: enrollment?.courseId?.title || "Unknown Course",
          percentage: Math.round((s.present / s.total) * 100),
          total: s.total,
          present: s.present,
        };
      })
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRecords,
          totalCourses,
          totalStudents,
          recentTotal,
          overallRate:
            recentTotal > 0
              ? Math.round(((counts.present + counts.late) / recentTotal) * 100)
              : 0,
          ...counts,
        },
        dailyTrend,
        courseStats,
        lowAttendanceAlerts,
        distribution: [
          { name: "Present", value: counts.present, color: "#10b981" },
          { name: "Absent", value: counts.absent, color: "#f43f5e" },
          { name: "Late", value: counts.late, color: "#f59e0b" },
          { name: "Leave", value: counts.leave, color: "#3b82f6" },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/admin/attendance/reports?courseId=&from=&to=&status=&page=1
// Filterable attendance report for admin
// ======================================================
export async function getAdminAttendanceReportsController(req, res, next) {
  try {
    const {
      courseId,
      teacherId,
      from,
      to,
      status,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (teacherId) query.teacherId = teacherId;
    if (status) query.status = status;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = toUTCDate(from);
      if (to) {
        const toDate = toUTCDate(to);
        toDate.setUTCHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate("studentId", "name email")
        .populate("courseId", "title")
        .populate("teacherId", "name")
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Attendance.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}
