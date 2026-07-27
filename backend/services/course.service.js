import mongoose from "mongoose";
import { Course } from "../models/Course.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

export const courseService = {
  // Fetch courses owned by a specific instructor
  async getCoursesByTeacher(teacherId) {
    return await Course.find({ teacherId })
      .sort({ createdAt: -1 })
      .populate("teacherId", "name email avatar");
  },

  // Create a brand new course
  async createCourse(teacherId, data) {
    if (!data.title) {
      throw new BadRequestError("Course title is required");
    }
    return await Course.create({
      ...data,
      teacherId,
      students: [],
      lectures: [],
      totalLectures: 0,
      totalDuration: 0,
    });
  },

  // Add a video lecture to a course with auto-recalculating aggregates
  async addLecture(courseId, teacherId, lecture) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new BadRequestError("Invalid course ID");
    }

    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (!lecture.title) {
      throw new BadRequestError("Lecture title is required");
    }

    course.lectures.push({
      ...lecture,
      createdAt: new Date(),
    });

    // Auto-update schema properties
    course.totalLectures = course.lectures.length;
    course.totalDuration = course.lectures.reduce(
      (sum, item) => sum + (item.duration || 0),
      0,
    );

    await course.save();
    return course;
  },

  // Enroll a student in a course
  async enrollStudent(courseId, studentId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const alreadyEnrolled = course.students.some(
      (id) => id.toString() === studentId.toString(),
    );

    if (alreadyEnrolled) {
      throw new BadRequestError("Student already enrolled");
    }

    course.students.push(studentId);
    await course.save();
    return course;
  },
};
