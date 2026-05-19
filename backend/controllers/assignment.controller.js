import { BadRequestError } from "../utils/errors.js";
import { assignmentService } from "../services/assignment.service.js";

export async function getAssignmentsController(req, res, next) {
  try {
    const assignments = await assignmentService.getAssignmentsByTeacher(req.user._id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

export async function createAssignmentController(req, res, next) {
  try {
    const { title, description, courseId, dueDate, fileUrl, totalPoints } = req.body;
    if (!title || !courseId || !dueDate) throw new BadRequestError("title, courseId and dueDate are required");

    const assignment = await assignmentService.createAssignment(req.user._id, {
      title, description, courseId, dueDate, fileUrl, totalPoints,
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function updateAssignmentController(req, res, next) {
  try {
    const { id } = req.params;
    const assignment = await assignmentService.updateAssignment(id, req.user._id, req.body);
    res.json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function deleteAssignmentController(req, res, next) {
  try {
    const { id } = req.params;
    await assignmentService.deleteAssignment(id, req.user._id);
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    next(err);
  }
}

export async function gradeSubmissionController(req, res, next) {
  try {
    const { id } = req.params;
    const { studentId, grade, feedback } = req.body;
    if (!studentId || grade == null) throw new BadRequestError("studentId and grade are required");

    const assignment = await assignmentService.gradeSubmission(id, req.user._id, studentId, { grade, feedback });
    res.json(assignment);
  } catch (err) {
    next(err);
  }
}