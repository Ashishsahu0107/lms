import { Course } from "../models/Course.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { Assignment } from "../models/Assignment.js";
import { Quiz } from "../models/Quiz.js";

export const analyticsService = {
  async getTeacherAnalytics(teacherId) {
    const courses = await Course.find({ teacherId });

    const totalStudents = new Set(
      courses.flatMap((c) => c.students.map((s) => s.toString()))
    ).size;

    const totalRevenue = courses
      .filter((c) => c.status === "published")
      .reduce((sum, c) => sum + c.price * (c.students?.length || 0), 0);

    const publishedCourses = courses.filter((c) => c.status === "published").length;

    const progressRecords = await StudentProgress.find({
      courseId: { $in: courses.map((c) => c._id) },
    });

    const avgCompletion =
      progressRecords.length > 0
        ? Math.round(
            progressRecords.reduce((sum, p) => sum + (p.progress || 0), 0) /
              progressRecords.length
          )
        : 0;

    const monthlyStudents = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = courses.reduce((sum, c) => {
        return sum + c.students.filter((s) => {
          const enrolled = c.createdAt;
          return enrolled >= d && enrolled < next;
        }).length;
      }, 0);
      monthlyStudents.push({
        month: d.toLocaleString("default", { month: "short" }),
        students: count,
      });
    }

    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const progress = await StudentProgress.find({ courseId: course._id });
        const avgProg =
          progress.length > 0
            ? Math.round(progress.reduce((s, p) => s + (p.progress || 0), 0) / progress.length)
            : 0;
        return {
          title: course.title,
          students: course.students.length,
          completionRate: avgProg,
        };
      })
    );

    const pendingAssignments = await Assignment.countDocuments({
      teacherId,
      dueDate: { $gte: new Date() },
    });

    const activeQuizzes = await Quiz.countDocuments({
      teacherId,
      status: "published",
    });

    return {
      totalCourses: courses.length,
      publishedCourses,
      totalStudents,
      totalRevenue,
      avgCompletion: avgCompletion,
      monthlyStudents,
      courseStats,
      pendingAssignments,
      activeQuizzes,
    };
  },
};