import {
  BadRequestError,
} from "../utils/errors.js";

import { courseService } from "../services/course.service.js";

import { getIO } from "../socket/index.js";

// =====================================
// GET ALL COURSES
// =====================================
export async function getCoursesController(
  req,
  res,
  next
) {
  try {

    const courses =
      await courseService.getCoursesByTeacher(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// GET COURSE BY ID
// =====================================
export async function getCourseByIdController(
  req,
  res,
  next
) {
  try {

    const { id } = req.params;

    const course =
      await courseService.getCourseById(
        id,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      data: course,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// CREATE COURSE
// =====================================
export async function createCourseController(
  req,
  res,
  next
) {
  try {

    const {
      title,
      description,
      category,
      price,
      thumbnail,
      status,
      difficulty,
      tags,
    } = req.body;

    // Validation
    if (!title) {
      throw new BadRequestError(
        "Course title is required"
      );
    }

    // Create Course
    const course =
      await courseService.createCourse(
        req.user._id,
        {
          title,
          description,
          category,
          price,
          thumbnail,
          status,
          difficulty,
          tags,
        }
      );

    // Realtime Emit
    const io = getIO();

    io.emit("course-created", {
      course,
      teacherId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// UPDATE COURSE
// =====================================
export async function updateCourseController(
  req,
  res,
  next
) {
  try {

    const { id } = req.params;

    const updatedCourse =
      await courseService.updateCourse(
        id,
        req.user._id,
        req.body
      );

    // Realtime Emit
    const io = getIO();

    io.emit("course-updated", {
      course: updatedCourse,
      updatedBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE COURSE
// =====================================
export async function deleteCourseController(
  req,
  res,
  next
) {
  try {

    const { id } = req.params;

    await courseService.deleteCourse(
      id,
      req.user._id
    );

    // Realtime Emit
    const io = getIO();

    io.emit("course-deleted", {
      courseId: id,
      deletedBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// ADD LECTURE
// =====================================
export async function addLectureController(
  req,
  res,
  next
) {
  try {

    const { id } = req.params;

    const updatedCourse =
      await courseService.addLecture(
        id,
        req.user._id,
        req.body
      );

    // Realtime Emit
    const io = getIO();

    io.emit("lecture-added", {
      courseId: id,
      course: updatedCourse,
    });

    return res.status(200).json({
      success: true,
      message: "Lecture added successfully",
      data: updatedCourse,
    });

  } catch (err) {
    next(err);
  }
}