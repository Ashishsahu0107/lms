import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Module } from "../models/Module.js";
import { Enrollment } from "../models/Enrollment.js";

// =====================================
// ASSIGN COURSE TO STUDENT (Enroll Student)
// =====================================
export async function assignCourseController(req, res, next) {
  try {
    const { studentId, email, courseId } = req.body ?? {};

    if (!courseId) {
      throw new BadRequestError("Course ID is required");
    }

    let targetStudentId = studentId;

    // Support lookup by Email
    if (email) {
      const student = await User.findOne({ email: email.toLowerCase(), role: "student" });
      if (!student) {
        throw new NotFoundError("Student with this email not found");
      }
      targetStudentId = student._id;
    }

    if (!targetStudentId) {
      throw new BadRequestError("Student ID or Email is required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Verify ownership for teachers
    if (req.user.role === "teacher" && course.teacherId.toString() !== req.user._id.toString()) {
      throw new BadRequestError("Access Denied: you can only assign students to your own courses");
    }

    // Check existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      studentId: targetStudentId,
      courseId,
    });

    if (existingEnrollment) {
      throw new BadRequestError("Student is already enrolled in this course");
    }

    // Create Enrollment
    const enrollment = await Enrollment.create({
      studentId: targetStudentId,
      courseId,
      assignedBy: req.user._id,
      progress: 0,
      completedTopics: [],
    });

    // Add student to Course students array
    if (!course.students.includes(targetStudentId)) {
      course.students.push(targetStudentId);
      await course.save();
    }

    // Emit live student enrollment socket event
    try {
      const student = await User.findById(targetStudentId).select("name").lean();
      const studentName = student ? student.name : "A student";
      const { emitStudentJoined } = await import("../socket/index.js");
      emitStudentJoined({
        studentId: targetStudentId,
        studentName,
        courseId,
        courseTitle: course.title,
        enrolledAt: enrollment.createdAt || new Date(),
      });
    } catch (e) {
      console.error("Failed to emit studentJoined socket event:", e);
    }

    return res.status(201).json({
      success: true,
      message: "Course successfully assigned to student",
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GET STUDENT ENROLLMENTS
// =====================================
export async function getStudentEnrollmentsController(req, res, next) {
  try {
    const { id: studentId } = req.params;

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: "courseId",
        populate: {
          path: "teacherId",
          select: "name avatar"
        }
      });

    return res.status(200).json({
      success: true,
      message: "Enrollments fetched successfully",
      data: enrollments,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// MARK TOPIC PROGRESS (Dynamic Auto-Save)
// =====================================
export async function markTopicProgressController(req, res, next) {
  try {
    const { courseId, topicId, completed } = req.body ?? {};

    if (!courseId || !topicId) {
      throw new BadRequestError("Course ID and Topic ID are required");
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!enrollment) {
      throw new NotFoundError("Enrollment record not found for this course");
    }

    const topicIdx = enrollment.completedTopics.indexOf(topicId);

    if (completed) {
      if (topicIdx === -1) {
        enrollment.completedTopics.push(topicId);
      }
    } else {
      if (topicIdx !== -1) {
        enrollment.completedTopics.splice(topicIdx, 1);
      }
    }

    // Fetch all topics inside all modules of this course to calculate overall progress
    const modules = await Module.find({ courseId }).populate("topics");
    
    let totalTopicsCount = 0;
    for (const mod of modules) {
      totalTopicsCount += mod.topics?.length || 0;
    }

    // Avoid divide-by-zero
    if (totalTopicsCount > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedTopics.length / totalTopicsCount) * 100
      );
    } else {
      enrollment.progress = 100;
    }

    await enrollment.save();

    // Emit live student topic progress update socket event
    try {
      const { emitProgressUpdated } = await import("../socket/index.js");
      emitProgressUpdated(req.user._id.toString(), {
        studentId: req.user._id.toString(),
        studentName: req.user.name,
        courseId,
        progress: enrollment.progress,
        completed: !!completed,
        topicId,
      });
    } catch (e) {
      console.error("Failed to emit progressUpdated socket event:", e);
    }

    return res.status(200).json({
      success: true,
      message: "Topic progress updated successfully",
      data: {
        progress: enrollment.progress,
        completedTopics: enrollment.completedTopics,
      },
    });
  } catch (err) {
    next(err);
  }
}
