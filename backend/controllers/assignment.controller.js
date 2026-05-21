import { BadRequestError } from "../utils/errors.js";

import { assignmentService } from "../services/assignment.service.js";

import { getIO } from "../socket/index.js";

// =====================================
// GET ASSIGNMENTS
// =====================================
export async function getAssignmentsController(
  req,
  res,
  next
) {
  try {

    const assignments =
      await assignmentService.getAssignmentsByTeacher(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Assignments fetched successfully",
      data: assignments,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// CREATE ASSIGNMENT
// =====================================
export async function createAssignmentController(
  req,
  res,
  next
) {
  try {

    const {
      title,
      description,
      courseId,
      dueDate,
      fileUrl,
      totalPoints,
    } = req.body;

    // Validation
    if (
      !title ||
      !courseId ||
      !dueDate
    ) {
      throw new BadRequestError(
        "title, courseId and dueDate are required"
      );
    }

    // Create Assignment
    const assignment =
      await assignmentService.createAssignment(
        req.user._id,
        {
          title,
          description,
          courseId,
          dueDate,
          fileUrl,
          totalPoints,
        }
      );

    // =====================================
    // REALTIME EVENT
    // =====================================
    const io = getIO();

    io.emit("assignment-created", {
      assignment,
      teacherId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// UPDATE ASSIGNMENT
// =====================================
export async function updateAssignmentController(
  req,
  res,
  next
) {
  try {

    const { id } = req.params;

    const updatedAssignment =
      await assignmentService.updateAssignment(
        id,
        req.user._id,
        req.body
      );

    // =====================================
    // REALTIME EVENT
    // =====================================
    const io = getIO();

    io.emit("assignment-updated", {
      assignment: updatedAssignment,
      updatedBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE ASSIGNMENT
// =====================================
export async function deleteAssignmentController(
  req,
  res,
  next
) {
  try {

    const { id } = req.params;

    await assignmentService.deleteAssignment(
      id,
      req.user._id
    );

    // =====================================
    // REALTIME EVENT
    // =====================================
    const io = getIO();

    io.emit("assignment-deleted", {
      assignmentId: id,
      deletedBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// GRADE SUBMISSION
// =====================================
export async function gradeSubmissionController(
  req,
  res,
  next
) {
  try {

    const { id } = req.params;

    const {
      studentId,
      grade,
      feedback,
    } = req.body;

    // Validation
    if (
      !studentId ||
      grade == null
    ) {
      throw new BadRequestError(
        "studentId and grade are required"
      );
    }

    // Grade Assignment
    const assignment =
      await assignmentService.gradeSubmission(
        id,
        req.user._id,
        studentId,
        {
          grade,
          feedback,
        }
      );

    // =====================================
    // REALTIME EVENT
    // =====================================
    const io = getIO();

    // Notify Student
    io.to(`user:${studentId}`).emit(
      "assignment-graded",
      {
        assignmentId: id,
        grade,
        feedback,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Assignment graded successfully",
      data: assignment,
    });

  } catch (err) {
    next(err);
  }
}