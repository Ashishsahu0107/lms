import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";
import { buildFileUrl } from "../middleware/upload.js";
import { emitAssignmentGraded } from "../socket/index.js";

// =====================================
// UPLOAD FILE SUBMISSION (Student-facing, returns uploaded file URL)
// =====================================
export async function uploadSubmissionFileController(req, res, next) {
  try {
    if (!req.file) {
      throw new BadRequestError("No file provided for upload");
    }

    let subdir = "documents";
    if (req.file.mimetype.startsWith("image/")) {
      subdir = "thumbnails";
    } else if (req.file.mimetype.startsWith("video/")) {
      subdir = "videos";
    }

    const fileUrl = buildFileUrl(req, req.file.filename, subdir);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: req.file.originalname,
        url: fileUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}

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

    // Emit real-time submission alert to the teacher
    try {
      const teacherId = assignment.createdBy.toString();
      const payload = {
        submissionId: submission._id,
        assignmentId: assignment._id,
        studentId: req.user._id,
        studentName: req.user.name,
        title: assignment.title,
        submittedAt: submission.submittedAt,
      };
      const { emitAssignmentSubmitted } = await import("../socket/index.js");
      emitAssignmentSubmitted(teacherId, payload);
    } catch (e) {
      console.error("Failed to emit assignment submission socket event:", e);
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
    const { marks, feedback, rubricEvaluation } = req.body ?? {};

    const submission = await Submission.findById(id).populate("assignmentId");
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const assignment = submission.assignmentId;
    let finalMarks = marks;

    // If rubricEvaluation is provided, calculate finalMarks from sum of scores
    if (Array.isArray(rubricEvaluation) && rubricEvaluation.length > 0) {
      finalMarks = rubricEvaluation.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
      submission.rubricEvaluation = rubricEvaluation;
    } else if (marks === undefined || marks === null) {
      throw new BadRequestError("Marks/Grade score or Rubric evaluation breakdown is required");
    }

    // Verify score boundary
    if (Number(finalMarks) > assignment.totalMarks) {
      throw new BadRequestError(
        `Grade score (${finalMarks}) cannot exceed total marks of ${assignment.totalMarks} allowed for this assignment.`
      );
    }

    submission.marks = Number(finalMarks);
    submission.feedback = feedback || "";
    submission.status = "graded";
    await submission.save();

    // Emit real-time graded alert to the student
    try {
      const payload = {
        submissionId: submission._id,
        assignmentId: assignment._id,
        title: assignment.title,
        marks: submission.marks,
        feedback: submission.feedback,
        rubricEvaluation: submission.rubricEvaluation,
      };
      emitAssignmentGraded(submission.studentId.toString(), payload);
    } catch (e) {
      console.error("Failed to emit assignment graded socket event:", e);
    }

    return res.status(200).json({
      success: true,
      message: "Submission successfully evaluated and graded!",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
}

