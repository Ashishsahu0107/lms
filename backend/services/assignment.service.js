import mongoose from "mongoose";

import { Assignment } from "../models/Assignment.js";

import { NotFoundError, BadRequestError } from "../utils/errors.js";

export const assignmentService = {
  // =====================================
  // GET ASSIGNMENTS BY TEACHER
  // =====================================
  async getAssignmentsByTeacher(teacherId) {
    const assignments = await Assignment.find({
      teacherId,
    })
      .populate("courseId", "title thumbnail")
      .sort({
        dueDate: 1,
      });

    return assignments;
  },

  // =====================================
  // CREATE ASSIGNMENT
  // =====================================
  async createAssignment(teacherId, data) {
    // Validation
    if (!data.title) {
      throw new BadRequestError("Assignment title is required");
    }

    if (!data.courseId) {
      throw new BadRequestError("Course ID is required");
    }

    // Create Assignment
    const assignment = await Assignment.create({
      ...data,

      teacherId,

      submissions: [],
    });

    return assignment.populate("courseId", "title thumbnail");
  },

  // =====================================
  // UPDATE ASSIGNMENT
  // =====================================
  async updateAssignment(assignmentId, teacherId, updates) {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new BadRequestError("Invalid assignment ID");
    }

    // Find Assignment
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacherId,
    });

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Update
    Object.assign(assignment, updates);

    await assignment.save();

    return assignment.populate("courseId", "title thumbnail");
  },

  // =====================================
  // DELETE ASSIGNMENT
  // =====================================
  async deleteAssignment(assignmentId, teacherId) {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new BadRequestError("Invalid assignment ID");
    }

    // Delete
    const assignment = await Assignment.findOneAndDelete({
      _id: assignmentId,
      teacherId,
    });

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    return assignment;
  },

  // =====================================
  // GRADE SUBMISSION
  // =====================================
  async gradeSubmission(
    assignmentId,
    teacherId,
    studentId,
    { grade, feedback },
  ) {
    // Find Assignment
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacherId,
    });

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Find Submission
    const submission = assignment.submissions.find(
      (item) => item.studentId.toString() === studentId.toString(),
    );

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    // Update Grade
    submission.grade = grade;

    submission.feedback = feedback || "";

    submission.gradedAt = new Date();

    submission.status = "graded";

    // Save
    await assignment.save();

    return assignment;
  },

  // =====================================
  // SUBMIT ASSIGNMENT
  // =====================================
  async submitAssignment(assignmentId, studentId, { submissionText, fileUrl }) {
    // Find Assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Already Submitted
    const alreadySubmitted = assignment.submissions.find(
      (item) => item.studentId.toString() === studentId.toString(),
    );

    if (alreadySubmitted) {
      throw new BadRequestError("Assignment already submitted");
    }

    // Add Submission
    assignment.submissions.push({
      studentId,

      submissionText,

      fileUrl,

      submittedAt: new Date(),

      status: "submitted",
    });

    await assignment.save();

    return assignment;
  },
};
