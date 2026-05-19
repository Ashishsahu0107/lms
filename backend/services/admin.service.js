import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Assignment } from "../models/Assignment.js";
import { Quiz } from "../models/Quiz.js";
import { Message } from "../models/Message.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

// Helper to build user projection
const userProj = "-password";

// ─── Dashboard Statistics ───────────────────────────────────────────────────
export const adminService = {
  async getDashboardStats() {
    const [totalUsers, teachers, students, courses, publishedCourses, assignments, quizzes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Assignment.countDocuments(),
      Quiz.countDocuments(),
    ]);

    // Calculate revenue estimate from published courses
    const coursesWithPrice = await Course.find({ status: "published", price: { $gt: 0 } }).select("price students");
    let totalRevenue = 0;
    let totalEnrollments = 0;
    for (const c of coursesWithPrice) {
      totalRevenue += c.price * (c.students?.length || 0);
      totalEnrollments += c.students?.length || 0;
    }

    // Active users today (simplified - users updated in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: oneDayAgo } });

    // Pending courses (draft status)
    const pendingCourses = await Course.countDocuments({ status: "draft" });

    // Monthly enrollments for last 6 months
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const monthlyEnrollments = await this.getMonthlyEnrollments(6);

    return {
      totalUsers,
      teachers,
      students,
      courses,
      publishedCourses,
      drafts: totalCourses - publishedCourses,
      totalRevenue,
      totalEnrollments,
      activeUsers,
      pendingCourses,
      assignments,
      quizzes,
      monthlyEnrollments,
    };
  },

  async getMonthlyEnrollments(months = 6) {
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [usersJoined, coursesCreated, enrollments] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Course.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Course.aggregate([
          { $unwind: "$students" },
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          { $count: "count" },
        ]),
      ]);

      result.push({
        month: date.toLocaleString("default", { month: "short" }),
        users: usersJoined,
        courses: coursesCreated,
        enrollments: enrollments[0]?.count || 0,
      });
    }
    return result;
  },

  async getRevenueData(months = 12) {
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const courses = await Course.find({
        status: "published",
        price: { $gt: 0 },
        createdAt: { $lte: end },
      }).select("price students createdAt");

      let monthRevenue = 0;
      let monthEnrollments = 0;
      for (const c of courses) {
        const studentCount = c.students?.length || 0;
        monthRevenue += c.price * studentCount;
        monthEnrollments += studentCount;
      }

      result.push({
        month: date.toLocaleString("default", { month: "short" }),
        revenue: monthRevenue,
        enrollments: monthEnrollments,
      });
    }
    return result;
  },

  // ─── Teacher Management ────────────────────────────────────────────────────
  async getTeachers({ page = 1, limit = 10, search = "", status = "" } = {}) {
    const query = { role: "teacher" };
    if (search) query.name = { $regex: search, $options: "i" };
    if (status === "active") query.isActive = true;
    if (status === "suspended") query.isActive = false;

    const skip = (page - 1) * limit;
    const [teachers, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).select(userProj),
      User.countDocuments(query),
    ]);

    // Enrich with course data
    const enriched = await Promise.all(
      teachers.map(async (t) => {
        const courses = await Course.find({ teacherId: t._id }).select("_id students price");
        const totalStudents = courses.reduce((a, c) => a + (c.students?.length || 0), 0);
        const totalRevenue = courses.reduce((a, c) => a + c.price * (c.students?.length || 0), 0);
        return {
          ...t.toObject(),
          coursesCount: courses.length,
          studentsCount: totalStudents,
          totalRevenue,
        };
      })
    );

    return { teachers: enriched, total, page, pages: Math.ceil(total / limit) };
  },

  async updateTeacher(teacherId, updates) {
    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) throw new NotFoundError("Teacher not found");

    const allowed = ["name", "email", "bio", "avatar", "isActive"];
    allowed.forEach((k) => {
      if (updates[k] !== undefined) teacher[k] = updates[k];
    });
    await teacher.save();
    return teacher.select(userProj);
  },

  async deleteTeacher(teacherId) {
    const teacher = await User.findOneAndDelete({ _id: teacherId, role: "teacher" });
    if (!teacher) throw new NotFoundError("Teacher not found");
    return teacher;
  },

  // ─── Student Management ─────────────────────────────────────────────────────
  async getStudents({ page = 1, limit = 10, search = "", status = "" } = {}) {
    const query = { role: "student" };
    if (search) query.name = { $regex: search, $options: "i" };
    if (status === "active") query.isActive = true;
    if (status === "suspended") query.isActive = false;

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).select(userProj),
      User.countDocuments(query),
    ]);

    // Enrich with progress data
    const enriched = await Promise.all(
      students.map(async (s) => {
        const progress = await StudentProgress.find({ studentId: s._id });
        const completedCourses = progress.filter((p) => p.progress === 100).length;
        return {
          ...s.toObject(),
          enrolledCourses: progress.length,
          completedCourses,
        };
      })
    );

    return { students: enriched, total, page, pages: Math.ceil(total / limit) };
  },

  async updateStudent(studentId, updates) {
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) throw new NotFoundError("Student not found");

    const allowed = ["name", "email", "bio", "avatar", "isActive"];
    allowed.forEach((k) => {
      if (updates[k] !== undefined) student[k] = updates[k];
    });
    await student.save();
    return student.select(userProj);
  },

  async deleteStudent(studentId) {
    const student = await User.findOneAndDelete({ _id: studentId, role: "student" });
    if (!student) throw new NotFoundError("Student not found");
    return student;
  },

  // ─── Course Management ──────────────────────────────────────────────────────
  async getCourses({ page = 1, limit = 10, search = "", status = "", category = "" } = {}) {
    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (status === "published") query.status = "published";
    if (status === "draft") query.status = "draft";
    if (category) query.category = category;

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("teacherId", "name avatar")
        .populate("students", "_id"),
      Course.countDocuments(query),
    ]);

    return {
      courses: courses.map((c) => ({
        ...c.toObject(),
        studentsCount: c.students?.length || 0,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  async updateCourse(courseId, updates) {
    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");

    const allowed = ["title", "description", "category", "price", "thumbnail", "status", "difficulty", "tags"];
    allowed.forEach((k) => {
      if (updates[k] !== undefined) course[k] = updates[k];
    });
    await course.save();
    return course.populate("teacherId", "name avatar");
  },

  async deleteCourse(courseId) {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  // ─── Payments ──────────────────────────────────────────────────────────────
  async getPayments({ page = 1, limit = 20, search = "", status = "" } = {}) {
    const courses = await Course.find({ status: "published", price: { $gt: 0 } })
      .populate("teacherId", "name")
      .populate("students", "_id");

    let payments = [];
    for (const course of courses) {
      if (course.students?.length > 0) {
        for (const student of course.students) {
          payments.push({
            _id: `${course._id}-${student._id}`,
            courseId: course._id,
            courseTitle: course.title,
            teacherId: course.teacherId._id,
            teacherName: course.teacherId.name,
            studentId: student._id,
            amount: course.price,
            platformFee: Math.round(course.price * 0.2 * 100) / 100,
            teacherEarning: Math.round(course.price * 0.8 * 100) / 100,
            status: "completed",
            date: course.updatedAt,
          });
        }
      }
    }

    // Sort by date descending
    payments.sort((a, b) => b.date - a.date);

    if (search) {
      payments = payments.filter(
        (p) =>
          p.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
          p.teacherName.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = payments.length;
    const skip = (page - 1) * limit;
    const paginated = payments.slice(skip, skip + limit);

    return { payments: paginated, total, page, pages: Math.ceil(total / limit) };
  },

  // ─── Reports ───────────────────────────────────────────────────────────────
  async getReportData(type = "overview") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      totalRevenue,
      monthlyNewUsers,
      topTeachers,
      topCourses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Course.aggregate([
        { $match: { status: "published", price: { $gt: 0 } } },
        { $project: { revenue: { $multiply: ["$price", { $size: { $ifNull: ["$students", []] } }] } } },
        { $group: { _id: null, total: { $sum: "$revenue" } } },
      ]),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Course.aggregate([
        { $match: { status: "published" } },
        { $project: { title: 1, teacherId: 1, studentsCount: { $size: { $ifNull: ["$students", []] } }, revenue: { $multiply: ["$price", { $size: { $ifNull: ["$students", []] } }] } } },
        { $sort: { studentsCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: "users", localField: "teacherId", foreignField: "_id", as: "teacher" } },
        { $unwind: "$teacher" },
        { $project: { title: 1, studentsCount: 1, revenue: 1, teacherName: "$teacher.name" } },
      ]),
      Course.aggregate([
        { $match: { status: "published" } },
        { $project: { title: 1, studentsCount: { $size: { $ifNull: ["$students", []] } }, revenue: { $multiply: ["$price", { $size: { $ifNull: ["$students", []] } }] } } },
        { $sort: { studentsCount: -1 } },
        { $limit: 10 },
        { $project: { title: 1, studentsCount: 1, revenue: 1 } },
      ]),
    ]);

    return {
      overview: { totalUsers, totalTeachers, totalStudents, totalCourses, totalRevenue: totalRevenue[0]?.total || 0, monthlyNewUsers },
      topTeachers,
      topCourses,
    };
  },

  // ─── Notifications ─────────────────────────────────────────────────────────
  async getNotifications() {
    // Generate system notifications based on platform data
    const [pendingCourses, newTeachers, activeUsers] = await Promise.all([
      Course.countDocuments({ status: "draft" }),
      User.countDocuments({ role: "teacher", createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    ]);

    return [
      { id: 1, type: "warning", title: "Pending Course Reviews", message: `${pendingCourses} courses awaiting approval`, read: false, time: new Date() },
      { id: 2, type: "info", title: "New Teachers", message: `${newTeachers} new teachers registered this week`, read: false, time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: 3, type: "success", title: "Platform Activity", message: `${activeUsers} users active in last 24 hours`, read: true, time: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    ];
  },

  // ─── System Settings ────────────────────────────────────────────────────────
  async getSettings() {
    return {
      platformName: "LMS Pro",
      platformEmail: "support@lmspro.edu",
      maintenanceMode: false,
      registrationEnabled: true,
      platformCommission: 20,
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpFrom: "",
      maxUploadSize: 100,
      allowedFileTypes: [".pdf", ".docx", ".mp4", ".jpg"],
    };
  },

  async updateSettings(updates) {
    // In production, you'd store these in a dedicated settings collection
    return { success: true, ...updates };
  },

  // ─── Audit Logs ─────────────────────────────────────────────────────────────
  async getAuditLogs({ page = 1, limit = 50, userId = "", action = "" } = {}) {
    // Mock audit logs for demonstration
    const logs = [
      { _id: "1", userId: "admin", action: "UPDATE_TEACHER", target: "teacher_id_1", details: "Updated teacher profile", ip: "192.168.1.1", timestamp: new Date() },
      { _id: "2", userId: "admin", action: "DELETE_COURSE", target: "course_id_1", details: "Deleted course for policy violation", ip: "192.168.1.1", timestamp: new Date(Date.now() - 60 * 60 * 1000) },
      { _id: "3", userId: "admin", action: "SUSPEND_STUDENT", target: "student_id_1", details: "Suspended student for spam", ip: "192.168.1.1", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { _id: "4", userId: "admin", action: "APPROVE_COURSE", target: "course_id_2", details: "Approved course publication", ip: "192.168.1.1", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { _id: "5", userId: "admin", action: "UPDATE_SETTINGS", target: "system", details: "Changed platform commission to 20%", ip: "192.168.1.1", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    ];

    let filtered = logs;
    if (userId) filtered = filtered.filter((l) => l.userId === userId);
    if (action) filtered = filtered.filter((l) => l.action === action);

    const total = filtered.length;
    const skip = (page - 1) * limit;
    return { logs: filtered.slice(skip, skip + limit), total, page, pages: Math.ceil(total / limit) };
  },
};