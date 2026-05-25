import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";

// =====================================
// SUBMIT ASSIGNMENT (Student-facing, handles resubmission)
// =====================================
export async function submitAssignmentController(req, res, next) {
  try {
    const { assignmentId, files, textAnswer } = req.body ?? {};

    if (!assignmentId) {
      throw new BadRequestError("Assignment ID is required");
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Check if deadline is passed to determine late status
    const isLate = new Date() > new Date(assignment.dueDate);
    const submissionStatus = isLate ? "late" : "pending";

    // Handle student resubmission
    let submission = await Submission.findOne({
      studentId: req.user._id,
      assignmentId,
    });

    if (submission) {
      // Overwrite/Update existing submission details
      submission.files = files || [];
      submission.textAnswer = textAnswer || "";
      submission.submittedAt = new Date();
      submission.status = submissionStatus;
      await submission.save();
    } else {
      // Create new submission record
      submission = await Submission.create({
        assignmentId,
        studentId: req.user._id,
        files: files || [],
        textAnswer: textAnswer || "",
        submittedAt: new Date(),
        status: submissionStatus,
      });
    }

    return res.status(201).json({
      success: true,
      message: isLate ? "Assignment submitted successfully (marked late)" : "Assignment submitted successfully",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GET SUBMISSIONS FOR EVALUATION (Teacher/Admin-facing)
// =====================================
export async function getAssignmentSubmissionsController(req, res, next) {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Verify ownership for teachers
    if (req.user.role === "teacher" && assignment.createdBy.toString() !== req.user._id.toString()) {
      throw new BadRequestError("Access Denied: you can only view submissions for assignments you created");
    }

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name email avatar")
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
}


// =====================================
// GET SINGLE SUBMISSION BY ID (Teacher/Admin-facing)
// =====================================
export async function getSubmissionByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate("studentId", "name email avatar")
      .populate({
        path: "assignmentId",
        populate: {
          path: "courseId",
          select: "title totalMarks"
        }
      });

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    return res.status(200).json({
      success: true,
      message: "Submission details fetched successfully",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// REVIEW & GRADE SUBMISSION (Teacher/Admin-facing)
// =====================================
export async function reviewSubmissionController(req, res, next) {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body ?? {};

    if (marks === undefined || marks === null) {
      throw new BadRequestError("Marks/Grade score is required");
    }

    const submission = await Submission.findById(id).populate("assignmentId");
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const assignment = submission.assignmentId;
    
    // Verify score boundary
    if (Number(marks) > assignment.totalMarks) {
      throw new BadRequestError(
        `Grade score (${marks}) cannot exceed total marks of ${assignment.totalMarks} allowed for this assignment.`
      );
    }

    submission.marks = Number(marks);
    submission.feedback = feedback || "";
    submission.status = "graded";
    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Submission successfully evaluated and graded!",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
}

