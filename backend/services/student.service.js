import { Course } from "../models/Course.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { Assignment } from "../models/Assignment.js";
import { Quiz } from "../models/Quiz.js";
import { User } from "../models/User.js";
import { NotFoundError } from "../utils/errors.js";

// ─── Teacher-facing: students enrolled in teacher's courses ───────────────────
export const studentService = {
  async getStudentsByTeacher(teacherId) {
    const courses = await Course.find({ teacherId }).select("_id");
    const courseIds = courses.map((c) => c._id);

    const coursesWithStudents = await Course.find({ _id: { $in: courseIds } })
      .select("students")
      .populate("students", "name email avatar");

    const studentMap = new Map();
    for (const course of coursesWithStudents) {
      for (const student of course.students) {
        if (!studentMap.has(student._id.toString())) {
          studentMap.set(student._id.toString(), { ...student.toObject(), courseCount: 1 });
        } else {
          studentMap.get(student._id.toString()).courseCount += 1;
        }
      }
    }
    return Array.from(studentMap.values());
  },

  async getStudentProgress(courseId) {
    return StudentProgress.find({ courseId })
      .populate("studentId", "name email avatar")
      .sort({ lastAccessedAt: -1 });
  },

  async getStudentDetails(studentId) {
    const student = await User.findById(studentId).select("-password");
    if (!student) throw new NotFoundError("Student not found");
    return student;
  },

  // ─── Student-facing: student's own data ──────────────────────────────────
  async getEnrolledCourses(studentId) {
    const courses = await Course.find({ students: studentId })
      .populate("teacherId", "name avatar")
      .sort({ createdAt: -1 });

    return Promise.all(
      courses.map(async (course) => {
        const progress = await StudentProgress.findOne({ studentId, courseId: course._id });
        return {
          ...course.toObject(),
          progress: progress?.progress || 0,
          lectureProgress: progress?.lectureProgress || [],
          lastAccessedAt: progress?.lastAccessedAt,
        };
      })
    );
  },

  async getCourseDetails(courseId, studentId) {
    const course = await Course.findById(courseId).populate("teacherId", "name avatar email");
    if (!course) throw new NotFoundError("Course not found");

    const progress = await StudentProgress.findOne({ studentId, courseId });
    return { course, progress: progress || { progress: 0, lectureProgress: [], enrolledAt: new Date() } };
  },

  async updateProgress(studentId, courseId, lectureId) {
    let progress = await StudentProgress.findOne({ studentId, courseId });

    if (!progress) {
      progress = await StudentProgress.create({
        studentId, courseId,
        lectureProgress: [{ lectureId, completed: true, completedAt: new Date() }],
        progress: 0, lastAccessedAt: new Date(),
      });
    } else {
      const idx = progress.lectureProgress.findIndex((l) => l.lectureId.toString() === lectureId);
      if (idx >= 0) {
        progress.lectureProgress[idx].completed = true;
        progress.lectureProgress[idx].completedAt = new Date();
      } else {
        progress.lectureProgress.push({ lectureId, completed: true, completedAt: new Date() });
      }

      const course = await Course.findById(courseId);
      const total = course?.lectures?.length || 1;
      const done = progress.lectureProgress.filter((l) => l.completed).length;
      progress.progress = Math.round((done / total) * 100);
      progress.lastAccessedAt = new Date();
      if (progress.progress === 100) progress.completedAt = new Date();
      await progress.save();
    }
    return progress;
  },

  async enrollInCourse(studentId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    if (course.students.includes(studentId)) return course;
    course.students.push(studentId);
    await course.save();
    await StudentProgress.create({ studentId, courseId, lectureProgress: [], progress: 0, enrolledAt: new Date(), lastAccessedAt: new Date() });
    return course;
  },

  async submitAssignment(studentId, assignmentId, { fileUrl, notes }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new NotFoundError("Assignment not found");
    const already = assignment.submissions.find((s) => s.studentId.toString() === studentId);
    if (already) throw new NotFoundError("Already submitted");
    assignment.submissions.push({ studentId, fileUrl, submittedAt: new Date() });
    await assignment.save();
    return assignment;
  },

  async submitQuiz(studentId, quizId, { answers, score }) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found");
    const existing = quiz.results.find((r) => r.studentId.toString() === studentId);
    if (existing) { existing.score = score; existing.answers = answers; existing.completedAt = new Date(); }
    else quiz.results.push({ studentId, score, answers, completedAt: new Date() });
    await quiz.save();
    return quiz;
  },

  async getCertificate(studentId, courseId) {
    const progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress || progress.progress < 100) throw new NotFoundError("Certificate not available — course not completed");
    const course = await Course.findById(courseId).populate("teacherId", "name");
    const student = await User.findById(studentId).select("name email");
    return {
      studentName: student.name, studentEmail: student.email,
      courseTitle: course.title, teacherName: course.teacherId.name,
      completedAt: progress.completedAt, courseId,
    };
  },
};