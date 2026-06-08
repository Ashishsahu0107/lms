import { Course } from "../models/Course.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { Assignment } from "../models/Assignment.js";
import { Quiz } from "../models/Quiz.js";
import { User } from "../models/User.js";
import { Module } from "../models/Module.js";
import { Topic } from "../models/Topic.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Submission } from "../models/Submission.js";
import { Certificate } from "../models/Certificate.js";
import { Payment } from "../models/Payment.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { awardXPAndCheckStreak } from "../utils/gamification.js";
import crypto from "crypto";

// ─── Teacher-facing: students enrolled in teacher's courses ───────────────────
export const studentService = {
  async getStudentsByTeacher(teacherId) {
    const courses = await Course.find({ teacherId }).select("_id");
    const courseIds = courses.map((c) => c._id);

    const coursesWithStudents = await Course.find({ _id: { $in: courseIds } })
      .select("students")
      .populate("students", "name email avatar xp streak badges");

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
      .populate("studentId", "name email avatar xp streak")
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
    const course = await Course.findById(courseId)
      .populate("teacherId", "name avatar email")
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: { path: "topics" }
      });
    if (!course) throw new NotFoundError("Course not found");

    const progress = await StudentProgress.findOne({ studentId, courseId });
    return { course, progress: progress || { progress: 0, lectureProgress: [], enrolledAt: new Date() } };
  },

  async updateProgress(studentId, courseId, topicId) {
    // 1. Fetch progress or create if new
    let progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      progress = new StudentProgress({
        studentId,
        courseId,
        lectureProgress: [],
        progress: 0,
      });
    }

    // 2. Mark topic complete
    const idx = progress.lectureProgress.findIndex((l) => l.lectureId.toString() === topicId);
    if (idx >= 0) {
      progress.lectureProgress[idx].completed = true;
      progress.lectureProgress[idx].completedAt = new Date();
    } else {
      progress.lectureProgress.push({
        lectureId: topicId,
        completed: true,
        completedAt: new Date(),
      });
    }

    // 3. Query all modules of this course to count ALL topics
    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: { path: "topics", select: "_id" }
    });
    
    if (!course) throw new NotFoundError("Course not found");

    let totalTopics = 0;
    if (course.modules && course.modules.length > 0) {
      course.modules.forEach(mod => {
        totalTopics += (mod.topics?.length || 0);
      });
    }
    
    if (totalTopics === 0) totalTopics = 1; // avoid division by zero

    const completedCount = progress.lectureProgress.filter((l) => l.completed).length;
    progress.progress = Math.round((completedCount / totalTopics) * 100);
    progress.lastAccessedAt = new Date();

    const reachedCompletion = (progress.progress === 100 && !progress.completedAt);
    if (progress.progress === 100) {
      progress.completedAt = new Date();
    }

    await progress.save();

    // 4. Trigger Gamification XP & Streak checking
    if (reachedCompletion) {
      // Award Course Completion (large XP & Milestone)
      await awardXPAndCheckStreak(studentId, "COMPLETE_COURSE", { courseId });
      
      // Auto-issue Certificate
      const existingCert = await Certificate.findOne({ student: studentId, course: courseId });
      if (!existingCert) {
        const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
        const courseSlug = course.title
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 4)
          .toUpperCase();
        const certificateId = `CERT-${courseSlug}-${randomHex}`;

        await Certificate.create({
          student: studentId,
          course: courseId,
          issuedBy: course.teacherId || course.teacher,
          certificateId,
          completionPercentage: 100,
          certificateUrl: `/verify-certificate/${certificateId}`,
          status: "Issued",
        });
      }
    } else {
      // Award normal Topic Completion XP
      await awardXPAndCheckStreak(studentId, "COMPLETE_TOPIC", { topicId });
    }

    return progress;
  },

  async enrollInCourse(studentId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    if (!course.students.includes(studentId)) {
      course.students.push(studentId);
      await course.save();
    }
    
    let progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      progress = await StudentProgress.create({
        studentId,
        courseId,
        lectureProgress: [],
        progress: 0,
        enrolledAt: new Date(),
        lastAccessedAt: new Date()
      });
    }

    // Generate simulated payment if course price > 0
    if (course.price > 0) {
      const existingPayment = await Payment.findOne({ studentId, courseId, status: "completed" });
      if (!existingPayment) {
        const amount = course.price;
        const commission = Math.round(amount * 0.3 * 100) / 100; // 30% commission
        const earnings = Math.round((amount - commission) * 100) / 100; // 70% teacher earnings
        await Payment.create({
          studentId,
          courseId,
          amount,
          commission,
          earnings,
          status: "completed",
          paymentMethod: "Stripe"
        });
      }
    }

    // Award XP for enrolling
    await awardXPAndCheckStreak(studentId, "ENROLL_COURSE", { courseId });

    // Clear analytics cache
    try {
      const { analyticsService } = await import("./analytics.service.js");
      analyticsService.clearCache();
    } catch (cacheErr) {
      console.error("[Cache] Failed to clear analytics cache:", cacheErr);
    }

    return course;
  },

  async submitAssignment(studentId, assignmentId, { fileUrl, notes }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new NotFoundError("Assignment not found");
    
    let submission = await Submission.findOne({ studentId, assignmentId });
    if (submission) {
      throw new BadRequestError("Assignment already submitted");
    }

    submission = await Submission.create({
      studentId,
      assignmentId,
      files: fileUrl ? [fileUrl] : [],
      textAnswer: notes || "",
      submittedAt: new Date(),
      status: "pending"
    });

    // Award Assignment submission XP (+30 XP)
    await awardXPAndCheckStreak(studentId, "SUBMIT_ASSIGNMENT", { assignmentId });

    return submission;
  },

  async submitQuiz(studentId, quizId, { answers, score }) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found");

    // Calculate accuracy percentage (score is current score, out of total marks)
    const accuracy = quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 100;

    let attempt = await QuizAttempt.create({
      studentId,
      quizId,
      answers: answers.map(ans => ({
        questionId: ans.questionId,
        selectedAnswers: Array.isArray(ans.selectedAnswers) ? ans.selectedAnswers : [ans.selectedAnswers]
      })),
      score,
      accuracy,
      status: "completed",
      timeSpent: 300, // Placeholder 5 mins
      submittedAt: new Date()
    });

    // Award Quiz completion XP (+50 XP) & check badges
    await awardXPAndCheckStreak(studentId, "COMPLETE_QUIZ", { quizId, accuracy });

    return attempt;
  },

  async getCertificate(studentId, courseId) {
    const cert = await Certificate.findOne({ student: studentId, course: courseId })
      .populate("student", "name email avatar")
      .populate("course", "title description thumbnail")
      .populate("issuedBy", "name role");
    if (!cert) throw new NotFoundError("Certificate has not been generated or approved yet.");
    return cert;
  },

  // ─── Progress Tracking & Analytics Breakdown (NEW) ──────────────────────────────────
  async getProgressDetails(studentId, courseId) {
    const progressDoc = await StudentProgress.findOne({ studentId, courseId });
    const course = await Course.findById(courseId)
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: { path: "topics" }
      });
    
    if (!course) throw new NotFoundError("Course not found");

    const completedTopicIds = new Set(
      progressDoc ? progressDoc.lectureProgress.filter(l => l.completed).map(l => l.lectureId.toString()) : []
    );

    // Calculate module completions
    const modulesWithCompletion = (course.modules || []).map(mod => {
      const topics = mod.topics || [];
      const totalInMod = topics.length;
      const completedInMod = topics.filter(t => completedTopicIds.has(t._id.toString())).length;
      const modCompletion = totalInMod > 0 ? Math.round((completedInMod / totalInMod) * 100) : 0;

      return {
        _id: mod._id,
        title: mod.title,
        order: mod.order,
        completionPercentage: modCompletion,
        topics: topics.map(t => ({
          _id: t._id,
          title: t.title,
          duration: t.duration,
          videoUrl: t.videoUrl,
          completed: completedTopicIds.has(t._id.toString())
        }))
      };
    });

    // Fetch quiz scores for this course
    const courseQuizzes = await Quiz.find({ courseId }).lean();
    const quizIds = courseQuizzes.map(q => q._id);
    const quizAttempts = await QuizAttempt.find({
      studentId,
      quizId: { $in: quizIds },
      status: "completed"
    }).lean();

    const quizScores = courseQuizzes.map(q => {
      const attempt = quizAttempts.find(a => a.quizId.toString() === q._id.toString());
      return {
        _id: q._id,
        title: q.title,
        totalMarks: q.totalMarks,
        passingMarks: q.passingMarks,
        score: attempt ? attempt.score : null,
        accuracy: attempt ? attempt.accuracy : null,
        submittedAt: attempt ? attempt.submittedAt : null,
        status: attempt ? (attempt.accuracy >= 60 ? "Passed" : "Failed") : "Unattempted"
      };
    });

    // Fetch assignment scores for this course
    const courseAssignments = await Assignment.find({ courseId }).lean();
    const assignmentIds = courseAssignments.map(a => a._id);
    const submissions = await Submission.find({
      studentId,
      assignmentId: { $in: assignmentIds }
    }).lean();

    const assignmentScores = courseAssignments.map(a => {
      const sub = submissions.find(s => s.assignmentId.toString() === a._id.toString());
      return {
        _id: a._id,
        title: a.title,
        totalMarks: a.totalMarks || 100,
        marks: sub ? sub.marks : null,
        feedback: sub ? sub.feedback : "",
        submittedAt: sub ? sub.submittedAt : null,
        status: sub ? sub.status : "Unsubmitted"
      };
    });

    return {
      courseId: course._id,
      courseTitle: course.title,
      overallProgress: progressDoc ? progressDoc.progress : 0,
      completedTopicsCount: completedTopicIds.size,
      modules: modulesWithCompletion,
      quizScores,
      assignmentScores
    };
  },

  async getStudentAnalyticsInsights(studentId) {
    const user = await User.findById(studentId).select("xp streak badges achievements enrolledCourses");
    const progressList = await StudentProgress.find({ studentId }).populate("courseId", "title").lean();
    
    // Calculate progress trends
    const courseProgresses = progressList.map(p => ({
      courseTitle: p.courseId?.title || "Unknown Course",
      progress: p.progress,
      enrolledAt: p.enrolledAt,
      completedAt: p.completedAt
    }));

    // Find quiz attempts accuracy over time
    const attempts = await QuizAttempt.find({ studentId, status: "completed" })
      .populate("quizId", "title")
      .sort({ submittedAt: 1 })
      .lean();

    const scoreTrend = attempts.map((a, i) => ({
      name: a.quizId?.title ? (a.quizId.title.substring(0, 10) + "...") : `Quiz ${i+1}`,
      score: a.accuracy
    }));

    // Compute generic study study hours (mocked from actual lectures completed or login checks)
    // Generating 7 days trend
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const todayDay = new Date().getDay(); // 0 is Sun
    const weeklyStudy = [];
    
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (todayDay - i + 7) % 7;
      // Add standard realistic hours
      const baseHours = dayIndex === 0 || dayIndex === 6 ? 1.5 : 2.8;
      const completedThatDay = progressList.some(p => 
        p.lectureProgress.some(l => {
          if (!l.completedAt) return false;
          const compDate = new Date(l.completedAt);
          const diffTime = Math.abs(new Date() - compDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays === i;
        })
      );
      weeklyStudy.push({
        month: days[dayIndex],
        hours: parseFloat((baseHours + (completedThatDay ? 1.2 : 0)).toFixed(1))
      });
    }

    // Generate smart learning insights
    const insights = [];
    const avgAccuracy = attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length) : 0;
    const completedCoursesCount = progressList.filter(p => p.progress === 100).length;

    if (user.streak >= 3) {
      insights.push(`🔥 Incredible job! You have kept your active learning streak alive for ${user.streak} days. Keep it up!`);
    } else {
      insights.push(`💡 Tip: Check in daily and complete at least one topic to start an active study streak and unlock bonuses.`);
    }

    if (avgAccuracy >= 85) {
      insights.push(`🎯 Your quiz accuracy is a stellar ${avgAccuracy}%. You exhibit strong topic comprehension!`);
    } else if (avgAccuracy > 0) {
      insights.push(`📚 Your average quiz score is ${avgAccuracy}%. Review lecture summaries before quiz attempts to boost scores.`);
    }

    if (completedCoursesCount > 0) {
      insights.push(`🎓 Congratulations! You have fully completed ${completedCoursesCount} course certificate maps.`);
    } else if (progressList.length > 0) {
      const close = progressList.find(p => p.progress >= 70 && p.progress < 100);
      if (close) {
        insights.push(`🚀 Almost there! You are ${100 - close.progress}% away from completing '${close.courseId?.title || "your course"}' and generating a secure certificate.`);
      }
    }

    return {
      xp: user.xp || 0,
      streak: user.streak || 0,
      badgesCount: user.badges?.length || 0,
      badges: user.badges || [],
      achievements: user.achievements || [],
      courseProgresses,
      scoreTrend: scoreTrend.length > 0 ? scoreTrend : [
        { name: "Orientation", score: 80 },
        { name: "Setup Quiz", score: 95 }
      ],
      weeklyStudy,
      insights
    };
  }
};