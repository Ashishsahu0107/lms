import { Assignment } from "../models/Assignment.js";
import { NotFoundError } from "../utils/errors.js";

export const assignmentService = {
  async getAssignmentsByTeacher(teacherId) {
    return Assignment.find({ teacherId })
      .populate("courseId", "title")
      .sort({ dueDate: 1 });
  },

  async createAssignment(teacherId, data) {
    return Assignment.create({ ...data, teacherId });
  },

  async updateAssignment(assignmentId, teacherId, updates) {
    const assignment = await Assignment.findOne({ _id: assignmentId, teacherId });
    if (!assignment) throw new NotFoundError("Assignment not found");
    Object.assign(assignment, updates);
    await assignment.save();
    return assignment.populate("courseId", "title");
  },

  async deleteAssignment(assignmentId, teacherId) {
    const assignment = await Assignment.findOneAndDelete({ _id: assignmentId, teacherId });
    if (!assignment) throw new NotFoundError("Assignment not found");
    return assignment;
  },

  async gradeSubmission(assignmentId, teacherId, studentId, { grade, feedback }) {
    const assignment = await Assignment.findOne({ _id: assignmentId, teacherId });
    if (!assignment) throw new NotFoundError("Assignment not found");

    const submission = assignment.submissions.find(
      (s) => s.studentId.toString() === studentId
    );
    if (!submission) throw new NotFoundError("Submission not found");

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    await assignment.save();
    return assignment;
  },
};