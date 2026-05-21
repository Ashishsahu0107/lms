import mongoose from "mongoose";

import { Course } from "../models/Course.js";

import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../utils/errors.js";

export const courseService = {

  // =====================================
  // GET TEACHER COURSES
  // =====================================
  async getCoursesByTeacher(
    teacherId
  ) {

    const courses = await Course.find({
      teacherId,
    })
      .sort({ createdAt: -1 })
      .populate(
        "teacherId",
        "name email avatar"
      );

    return courses;
  },

  // =====================================
  // CREATE COURSE
  // =====================================
  async createCourse(
    teacherId,
    data
  ) {

    // Validation
    if (!data.title) {
      throw new BadRequestError(
        "Course title is required"
      );
    }

    // Create Course
    const course = await Course.create({
      ...data,

      teacherId,

      enrolledStudents: [],

      lectures: [],

      totalLectures: 0,

      totalDuration: 0,
    });

    return course;
  },

  // =====================================
  // UPDATE COURSE
  // =====================================
  async updateCourse(
    courseId,
    teacherId,
    updates
  ) {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        courseId
      )
    ) {
      throw new BadRequestError(
        "Invalid course ID"
      );
    }

    // Find Course
    const course = await Course.findOne({
      _id: courseId,
      teacherId,
    });

    if (!course) {
      throw new NotFoundError(
        "Course not found"
      );
    }

    // Update Fields
    Object.assign(course, updates);

    // Save
    await course.save();

    return course;
  },

  // =====================================
  // DELETE COURSE
  // =====================================
  async deleteCourse(
    courseId,
    teacherId
  ) {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        courseId
      )
    ) {
      throw new BadRequestError(
        "Invalid course ID"
      );
    }

    // Delete
    const deletedCourse =
      await Course.findOneAndDelete({
        _id: courseId,
        teacherId,
      });

    if (!deletedCourse) {
      throw new NotFoundError(
        "Course not found"
      );
    }

    return deletedCourse;
  },

  // =====================================
  // GET COURSE BY ID
  // =====================================
  async getCourseById(
    courseId,
    teacherId
  ) {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        courseId
      )
    ) {
      throw new BadRequestError(
        "Invalid course ID"
      );
    }

    // Find Course
    const course = await Course.findOne({
      _id: courseId,
      teacherId,
    })
      .populate(
        "teacherId",
        "name email avatar"
      )
      .populate(
        "enrolledStudents",
        "name email avatar"
      );

    if (!course) {
      throw new NotFoundError(
        "Course not found"
      );
    }

    return course;
  },

  // =====================================
  // ADD LECTURE
  // =====================================
  async addLecture(
    courseId,
    teacherId,
    lecture
  ) {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        courseId
      )
    ) {
      throw new BadRequestError(
        "Invalid course ID"
      );
    }

    // Find Course
    const course = await Course.findOne({
      _id: courseId,
      teacherId,
    });

    if (!course) {
      throw new NotFoundError(
        "Course not found"
      );
    }

    // Validate Lecture
    if (!lecture.title) {
      throw new BadRequestError(
        "Lecture title is required"
      );
    }

    // Push Lecture
    course.lectures.push({
      ...lecture,
      createdAt: new Date(),
    });

    // Recalculate Stats
    course.totalLectures =
      course.lectures.length;

    course.totalDuration =
      course.lectures.reduce(
        (sum, item) =>
          sum + (item.duration || 0),
        0
      );

    // Save
    await course.save();

    return course;
  },

  // =====================================
  // ENROLL STUDENT
  // =====================================
  async enrollStudent(
    courseId,
    studentId
  ) {

    const course = await Course.findById(
      courseId
    );

    if (!course) {
      throw new NotFoundError(
        "Course not found"
      );
    }

    // Already Enrolled
    const alreadyEnrolled =
      course.enrolledStudents.some(
        (id) =>
          id.toString() ===
          studentId.toString()
      );

    if (alreadyEnrolled) {
      throw new BadRequestError(
        "Student already enrolled"
      );
    }

    course.enrolledStudents.push(
      studentId
    );

    await course.save();

    return course;
  },
};