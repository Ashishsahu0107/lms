import { Attendance } from "../models/Attendance.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { getIO, ROOMS, emitAttendanceMarked } from "../socket/index.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors.js";
import mongoose from "mongoose";

// ─── Status Helpers ───────────────────────────────────────────────────────────
const STATUS_COLORS = {
  present: "#10b981",
  absent:  "#f43f5e",
  late:    "#f59e0b",
  leave:   "#3b82f6",
};

// ─── Shared: Verify teacher owns course ──────────────────────────────────────
async function verifyTeacherCourse(courseId, user) {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new BadRequestError("Invalid courseId format.");
  }
  const course = await Course.findById(courseId);
  if (!course) throw new NotFoundError("Course not found.");
  if (user.role !== "super_admin" && course.teacherId.toString() !== user._id.toString()) {
    throw new ForbiddenError("Access denied: you do not own this course.");
  }
  return course;
}

// ─── Shared: Normalize date to UTC midnight ───────────────────────────────────
function toUTCDate(dateStr) {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function dayRange(dateStr) {
  const start = toUTCDate(dateStr);
  const end = new Date(start);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

// ======================================================
// GET /api/attendance/course/:courseId/students?date=YYYY-MM-DD
// Enrolled students with attendance status overlay for a date
// ======================================================
export async function getCourseStudentsAttendanceController(req, res, next) {
  try {
    const { courseId } = req.params;
    const { date = new Date().toISOString().split("T")[0] } = req.query;

    await verifyTeacherCourse(courseId, req.user);

    const enrollments = await Enrollment.find({ courseId }).populate(
      "studentId",
      "name email avatar"
    );

    const { start, end } = dayRange(date);

    const records = await Attendance.find({
      courseId,
      date: { $gte: start, $lte: end },
    });

    const attendanceMap = {};
    const remarksMap = {};
    records.forEach((r) => {
      if (r.studentId) {
        attendanceMap[r.studentId.toString()] = r.status;
        remarksMap[r.studentId.toString()] = r.remarks || "";
      }
    });

    const students = enrollments
      .filter((e) => e.studentId)
      .map((e) => {
        const sid = e.studentId._id.toString();
        const savedStatus = attendanceMap[sid];
        return {
          id: sid,
          name: e.studentId.name || "Unknown",
          email: e.studentId.email || "",
          avatar: e.studentId.avatar || "",
          status: savedStatus || "present",
          remarks: remarksMap[sid] || "",
          alreadySaved: !!savedStatus,
        };
      });

    const summary = {
      total: students.length,
      present: students.filter((s) => s.status === "present").length,
      absent: students.filter((s) => s.status === "absent").length,
      late: students.filter((s) => s.status === "late").length,
      leave: students.filter((s) => s.status === "leave").length,
    };

    return res.status(200).json({
      success: true,
      data: students,
      meta: { courseId, date, ...summary },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// POST /api/attendance/mark-daily
// Save full attendance register for course+date (bulk replace)
// ======================================================
export async function markCourseAttendanceController(req, res, next) {
  try {
    const { courseId, date, students = [] } = req.body;

    if (!courseId || !date) throw new BadRequestError("courseId and date are required.");
    if (students.length === 0) throw new BadRequestError("Student list is empty.");

    await verifyTeacherCourse(courseId, req.user);

    const { start, end } = dayRange(date);
    const targetDate = toUTCDate(date);

    // Full-replace: delete existing records for this course+date
    await Attendance.deleteMany({
      courseId,
      date: { $gte: start, $lte: end },
    });

    const validStatuses = ["present", "absent", "late", "leave"];
    const records = students
      .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
      .map((s) => ({
        studentId: s.id,
        courseId,
        teacherId: req.user._id,
        markedBy: req.user._id,
        date: targetDate,
        status: validStatuses.includes(s.status) ? s.status : "present",
        remarks: s.remarks || "",
      }));

    let saved = [];
    if (records.length > 0) {
      saved = await Attendance.insertMany(records);
    }

    const payload = {
      courseId,
      date,
      count: saved.length,
      teacherId: req.user._id.toString(),
    };
    getIO().to(ROOMS.TEACHER_DASHBOARD).emit("attendanceUpdated", payload);
    emitAttendanceMarked(courseId, payload);

    return res.status(200).json({
      success: true,
      message: `Attendance saved for ${saved.length} student(s).`,
      data: { courseId, date, savedCount: saved.length },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// PUT /api/attendance/update/:attendanceId
// Edit a single attendance record
// ======================================================
export async function updateAttendanceController(req, res, next) {
  try {
    const { attendanceId } = req.params;
    const { status, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      throw new BadRequestError("Invalid attendanceId.");
    }

    const record = await Attendance.findById(attendanceId);
    if (!record) throw new NotFoundError("Attendance record not found.");

    // Verify teacher owns the course
    if (req.user.role !== "super_admin") {
      const course = await Course.findById(record.courseId);
      if (!course || course.teacherId.toString() !== req.user._id.toString()) {
        throw new ForbiddenError("Access denied.");
      }
    }

    const validStatuses = ["present", "absent", "late", "leave"];
    if (status && !validStatuses.includes(status)) {
      throw new BadRequestError("Invalid status value.");
    }

    if (status) record.status = status;
    if (remarks !== undefined) record.remarks = remarks;
    record.markedBy = req.user._id;
    await record.save();

    const payload = {
      attendanceId,
      status: record.status,
    };
    getIO().to(ROOMS.TEACHER_DASHBOARD).emit("attendanceUpdated", payload);
    emitAttendanceMarked(record.courseId.toString(), payload);

    return res.status(200).json({
      success: true,
      message: "Attendance updated.",
      data: record,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/attendance/history/:courseId?page=1&limit=10&from=&to=
// Paginated attendance session history for a course
// ======================================================
export async function getAttendanceHistoryController(req, res, next) {
  try {
    const { courseId } = req.params;
    const { from, to, page = 1, limit = 20 } = req.query;

    await verifyTeacherCourse(courseId, req.user);

    const dateFilter = {};
    if (from) dateFilter.$gte = toUTCDate(from);
    if (to) {
      const toDate = toUTCDate(to);
      toDate.setUTCHours(23, 59, 59, 999);
      dateFilter.$lte = toDate;
    }

    const query = { courseId };
    if (Object.keys(dateFilter).length > 0) query.date = dateFilter;

    // Get distinct dates (each date = one session)
    const allDates = await Attendance.distinct("date", query);
    allDates.sort((a, b) => new Date(b) - new Date(a));

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const paginatedDates = allDates.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // For each session date, get summary stats
    const sessions = await Promise.all(
      paginatedDates.map(async (sessionDate) => {
        const { start, end } = dayRange(sessionDate.toISOString().split("T")[0]);
        const records = await Attendance.find({
          courseId,
          date: { $gte: start, $lte: end },
        });

        const total = records.length;
        const counts = { present: 0, absent: 0, late: 0, leave: 0 };
        records.forEach((r) => counts[r.status]++);

        return {
          date: sessionDate.toISOString().split("T")[0],
          total,
          ...counts,
          rate: total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        total: allDates.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(allDates.length / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/attendance/date/:date?courseId=
// All attendance records for a specific date (optionally filtered by course)
// ======================================================
export async function getAttendanceByDateController(req, res, next) {
  try {
    const { date } = req.params;
    const { courseId } = req.query;

    const { start, end } = dayRange(date);
    const query = { teacherId: req.user._id, date: { $gte: start, $lte: end } };
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) query.courseId = courseId;

    const records = await Attendance.find(query)
      .populate("studentId", "name email avatar")
      .populate("courseId", "title")
      .sort({ courseId: 1, "studentId.name": 1 });

    return res.status(200).json({
      success: true,
      data: records,
      meta: { date, count: records.length },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/attendance/stats
// Real attendance stats for logged-in teacher
// ======================================================
export async function getAttendanceStatsController(req, res, next) {
  try {
    const teacherId = req.user._id;

    const courses = await Course.find({ teacherId }).select("_id title");
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          weeklyTrend: [],
          distribution: [
            { name: "Present", value: 0, color: STATUS_COLORS.present },
            { name: "Absent", value: 0, color: STATUS_COLORS.absent },
            { name: "Late", value: 0, color: STATUS_COLORS.late },
            { name: "Leave", value: 0, color: STATUS_COLORS.leave },
          ],
          totalRecords: 0,
          overallRate: 0,
        },
      });
    }

    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const records = await Attendance.find({
      teacherId,
      courseId: { $in: courseIds },
      date: { $gte: sixWeeksAgo },
    });

    const total = records.length;
    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    records.forEach((r) => counts[r.status]++);

    // Weekly buckets
    const weeklyMap = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const oneJan = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
      const key = `Wk ${weekNum}`;
      if (!weeklyMap[key]) weeklyMap[key] = { total: 0, present: 0, late: 0 };
      weeklyMap[key].total++;
      if (r.status === "present") weeklyMap[key].present++;
      if (r.status === "late") weeklyMap[key].late++;
    });

    const weeklyTrend = Object.entries(weeklyMap)
      .sort(([a], [b]) => parseInt(a.slice(3)) - parseInt(b.slice(3)))
      .slice(-6)
      .map(([week, d]) => ({
        week,
        rate: d.total > 0 ? Math.round(((d.present + d.late) / d.total) * 100) : 0,
        present: d.present,
        late: d.late,
        total: d.total,
      }));

    const distribution = Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      raw: value,
      color: STATUS_COLORS[name],
    }));

    return res.status(200).json({
      success: true,
      data: {
        weeklyTrend,
        distribution,
        totalRecords: total,
        overallRate: total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0,
        presentCount: counts.present,
        absentCount: counts.absent,
        lateCount: counts.late,
        leaveCount: counts.leave,
      },
    });
  } catch (err) {
    next(err);
  }
}
