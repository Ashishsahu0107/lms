import path from "path";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Course } from "../models/Course.js";
import { Module } from "../models/Module.js";
import { Topic } from "../models/Topic.js";
import { Enrollment } from "../models/Enrollment.js";
import { getIO, emitCourseCreated, emitCourseUpdated, emitCourseDeleted } from "../socket/index.js";
import { deleteUploadedFile, buildFileUrl } from "../middleware/upload.js";

// ──────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ──────────────────────────────────────────────────────────

/**
 * Parse tags — accepts a comma-separated string or an array.
 * Returns a deduped, trimmed array of non-empty strings (max 20 tags, 50 chars each).
 */
function parseTags(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw)
    ? raw
    : String(raw).split(",");
  return [...new Set(
    arr
      .map((t) => String(t).trim().slice(0, 50))
      .filter(Boolean)
  )].slice(0, 20);
}

/**
 * Validate all course fields — throws BadRequestError on first failure.
 */
function validateCoursePayload({ title, price, difficulty, status, duration }) {
  if (!title || !String(title).trim()) {
    throw new BadRequestError("Course title is required");
  }
  if (String(title).trim().length < 3) {
    throw new BadRequestError("Course title must be at least 3 characters");
  }
  if (String(title).trim().length > 200) {
    throw new BadRequestError("Course title cannot exceed 200 characters");
  }
  if (price !== undefined && price !== "" && (isNaN(Number(price)) || Number(price) < 0)) {
    throw new BadRequestError("Price must be a non-negative number");
  }
  const validDifficulty = ["beginner", "intermediate", "advanced"];
  if (difficulty && !validDifficulty.includes(difficulty)) {
    throw new BadRequestError(`Difficulty must be one of: ${validDifficulty.join(", ")}`);
  }
  const validStatuses = ["draft", "published", "archived"];
  if (status && !validStatuses.includes(status)) {
    throw new BadRequestError(`Status must be one of: ${validStatuses.join(", ")}`);
  }
  if (duration !== undefined && duration !== "" && (isNaN(Number(duration)) || Number(duration) < 0)) {
    throw new BadRequestError("Duration must be a non-negative number (minutes)");
  }
}

// ──────────────────────────────────────────────────────────
// GET ALL COURSES (Role & Filter Aware)
// ──────────────────────────────────────────────────────────
export async function getCoursesController(req, res, next) {
  try {
    let query = {};

    if (req.user.role === "student") {
      query = { students: req.user._id };
    } else if (req.user.role === "teacher") {
      query = { teacherId: req.user._id };
    }
    // super_admin sees everything

    const { category, search, status, difficulty } = req.query ?? {};
    if (category)   query.category   = { $regex: category, $options: "i" };
    if (difficulty) query.difficulty  = difficulty;
    if (status)     query.status      = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const courses = await Course.find(query)
      .populate("teacherId", "name email avatar")
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: { path: "topics", select: "title duration" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────
// GET COURSE BY ID
// ──────────────────────────────────────────────────────────
export async function getCourseByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("teacherId", "name email avatar")
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: { path: "topics" },
      })
      .lean();

    if (!course) throw new NotFoundError("Course not found");

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      data: course,
    });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────
// CREATE COURSE
// ──────────────────────────────────────────────────────────
export async function createCourseController(req, res, next) {
  try {
    const {
      title, description, category, price,
      status, difficulty, tags, duration,
    } = req.body ?? {};

    // ── Validate
    validateCoursePayload({ title, price, difficulty, status, duration });

    // ── Handle thumbnail upload (multer puts file in req.file)
    let thumbnailUrl = "";
    let thumbnailKey = "";
    if (req.file) {
      thumbnailKey = req.file.filename;
      thumbnailUrl = buildFileUrl(req, req.file.filename, "thumbnails");
    }

    // ── Create document
    const course = await Course.create({
      title:       String(title).trim(),
      description: description ? String(description).trim() : "",
      category:    category    ? String(category).trim()    : "",
      price:       Number(price) || 0,
      thumbnail:   thumbnailUrl,
      thumbnailKey,
      status:      status || "draft",
      difficulty:  difficulty || "beginner",
      tags:        parseTags(tags),
      duration:    Number(duration) || 0,
      teacherId:   req.user._id,
      modules:     [],
      students:    [],
    });

    emitCourseCreated(course);

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (err) {
    // If multer saved a file but the DB write failed, clean it up
    if (req.file) deleteUploadedFile(req.file.filename);
    next(err);
  }
}

// ──────────────────────────────────────────────────────────
// UPDATE COURSE
// ──────────────────────────────────────────────────────────
export async function updateCourseController(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title, description, category, price,
      status, difficulty, tags, duration,
    } = req.body ?? {};

    // ── Validate only provided fields
    validateCoursePayload({
      title:      title      ?? "placeholder_skip_title_required_check",
      price,
      difficulty,
      status,
      duration,
    });
    // Override: if title is explicitly provided, run its own check
    if (title !== undefined) {
      validateCoursePayload({ title, price: undefined, difficulty: undefined, status: undefined, duration: undefined });
    }

    // ── Allowlisted update object
    const allowed = {};
    if (title       !== undefined) allowed.title       = String(title).trim();
    if (description !== undefined) allowed.description = String(description).trim();
    if (category    !== undefined) allowed.category    = String(category).trim();
    if (price       !== undefined) allowed.price       = Math.max(0, Number(price) || 0);
    if (difficulty  !== undefined) allowed.difficulty  = difficulty;
    if (duration    !== undefined) allowed.duration    = Math.max(0, Number(duration) || 0);
    if (tags        !== undefined) allowed.tags        = parseTags(tags);
    const validStatuses = ["draft", "published", "archived"];
    if (status !== undefined && validStatuses.includes(status)) allowed.status = status;

    // ── Handle new thumbnail upload
    if (req.file) {
      // Retrieve old thumbnailKey to delete from disk
      const existing = await Course.findById(id).select("thumbnailKey").lean();
      if (existing?.thumbnailKey) {
        deleteUploadedFile(existing.thumbnailKey);
      }
      allowed.thumbnail    = buildFileUrl(req, req.file.filename, "thumbnails");
      allowed.thumbnailKey = req.file.filename;
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: allowed },
      { new: true, runValidators: true }
    ).populate("teacherId", "name email avatar");

    if (!course) throw new NotFoundError("Course not found");

    emitCourseUpdated(course);

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (err) {
    if (req.file) deleteUploadedFile(req.file.filename);
    next(err);
  }
}

// ──────────────────────────────────────────────────────────
// DELETE COURSE (Cascade)
// ──────────────────────────────────────────────────────────
export async function deleteCourseController(req, res, next) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).select("+thumbnailKey");
    if (!course) throw new NotFoundError("Course not found");

    // ── Cascade: topics → modules → enrollments → course
    const modules = await Module.find({ courseId: id }).lean();
    for (const mod of modules) {
      await Topic.deleteMany({ moduleId: mod._id });
    }
    await Module.deleteMany({ courseId: id });
    await Enrollment.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);

    // ── Clean up thumbnail from disk
    if (course.thumbnailKey) {
      deleteUploadedFile(course.thumbnailKey);
    }

    emitCourseDeleted(id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}