import { Notes } from "../models/Notes.js";
import { Course } from "../models/Course.js";
import { BadRequestError, ForbiddenError } from "../utils/errors.js";

// ============================================
// GET /api/notes
// Fetch notes filtered by courseId
// ============================================
export async function getNotes(req, res, next) {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      throw new BadRequestError("Course ID is required to fetch notes");
    }

    // Retrieve notes matching course
    const notes = await Notes.find({ courseId }).populate("teacherId", "name avatar");

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/notes
// Upload a note (Teacher/Super Admin only)
// ============================================
export async function createNote(req, res, next) {
  try {
    const { title, content, fileUrl, courseId } = req.body;
    const teacherId = req.user._id;

    if (!title || !courseId) {
      throw new BadRequestError("Title and Course ID are required");
    }

    // Verify course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      throw new BadRequestError("Course not found");
    }

    if (req.user.role !== "super_admin" && course.teacherId.toString() !== teacherId.toString()) {
      throw new ForbiddenError("You can only upload notes for your own courses");
    }

    const note = await Notes.create({
      title,
      content,
      fileUrl: fileUrl || "",
      courseId,
      teacherId,
    });

    // Gamification XP Reward to Teacher (simulate positive teacher behaviors)
    try {
      if (req.user.role === "student") {
        const { awardXP } = await import("../utils/gamification.js");
        await awardXP(teacherId, 10, "Upload course notes");
      }
    } catch (e) {
      // Ignored
    }

    return res.status(201).json({
      success: true,
      message: "Note uploaded successfully!",
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// DELETE /api/notes/:id
// Delete note (Teacher owner or Super Admin only)
// ============================================
export async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;
    const note = await Notes.findById(id);

    if (!note) {
      throw new BadRequestError("Note not found");
    }

    // Check course ownership
    const course = await Course.findById(note.courseId);
    if (
      req.user.role !== "super_admin" &&
      note.teacherId.toString() !== req.user._id.toString() &&
      (!course || course.teacherId.toString() !== req.user._id.toString())
    ) {
      throw new ForbiddenError("Access denied: you do not own this course or note");
    }

    await Notes.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Note removed successfully",
    });
  } catch (err) {
    next(err);
  }
}
