import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Course } from "../models/Course.js";
import { Module } from "../models/Module.js";
import { Topic } from "../models/Topic.js";
import { Enrollment } from "../models/Enrollment.js";
import { getIO } from "../socket/index.js";

// =====================================
// GET ALL COURSES (Role & Filter Aware)
// =====================================
export async function getCoursesController(req, res, next) {
  try {
    let query = {};
    
    if (req.user.role === "student") {
      query = { students: req.user._id };
    } else if (req.user.role === "teacher") {
      query = { teacherId: req.user._id };
    } // super_admin gets all

    const { category, search } = req.query ?? {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(query)
      .populate("teacherId", "name email avatar")
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: {
          path: "topics",
          select: "title duration"
        }
      })
      .sort({ createdAt: -1 });

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
// GET COURSE BY ID (Deeply Populated)
// =====================================
export async function getCourseByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("teacherId", "name email avatar")
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: {
          path: "topics"
        }
      });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

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
export async function createCourseController(req, res, next) {
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
      duration,
    } = req.body ?? {};

    if (!title) {
      throw new BadRequestError("Course title is required");
    }

    const course = await Course.create({
      title,
      description,
      category,
      price: price || 0,
      thumbnail,
      status: status || "draft",
      difficulty: difficulty || "beginner",
      tags: tags || [],
      duration: duration || "",
      teacherId: req.user._id,
      modules: [],
      students: [],
    });

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
export async function updateCourseController(req, res, next) {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("teacherId", "name email avatar");

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Realtime Emit
    const io = getIO();
    io.emit("course-updated", {
      course,
      updatedBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE COURSE (Cascade Aware)
// =====================================
export async function deleteCourseController(req, res, next) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Cascade delete Module & Topic docs associated with Course
    const modules = await Module.find({ courseId: id });
    for (const mod of modules) {
      await Topic.deleteMany({ moduleId: mod._id });
    }
    await Module.deleteMany({ courseId: id });
    
    // Delete all associated Enrollments
    await Enrollment.deleteMany({ courseId: id });

    await Course.findByIdAndDelete(id);

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