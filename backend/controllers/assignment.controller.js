import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Assignment } from "../models/Assignment.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Submission } from "../models/Submission.js";
import { getIO, emitAssignmentCreated } from "../socket/index.js";

// =====================================
// GET COURSE-WISE ASSIGNMENTS
// =====================================
export async function getAssignmentsController(req, res, next) {
  try {
    let query = {};

    if (req.user.role === "student") {
      // Find course IDs where student is enrolled
      const enrollments = await Enrollment.find({ studentId: req.user._id });
      const enrolledCourseIds = enrollments.map(e => e.courseId);
      query = { courseId: { $in: enrolledCourseIds } };
    } else if (req.user.role === "teacher") {
      // Find course IDs owned by teacher
      const courses = await Course.find({ teacherId: req.user._id });
      const teacherCourseIds = courses.map(c => c._id);
      query = { courseId: { $in: teacherCourseIds } };
    } // super_admin gets all

    const { courseId } = req.query ?? {};
    if (courseId) {
      query.courseId = courseId;
    }

    const assignments = await Assignment.find(query)
      .populate("courseId", "title thumbnail")
      .populate("moduleId", "title")
      .populate("topicId", "title")
      .populate("createdBy", "name")
      .sort({ dueDate: 1 });

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
// GET ASSIGNMENT BY ID (With Student Submission status)
// =====================================
export async function getAssignmentByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate("courseId", "title teacherId")
      .populate("moduleId", "title")
      .populate("topicId", "title")
      .populate("createdBy", "name");

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Lookup if the active student has already submitted answers
    let studentSubmission = null;
    if (req.user.role === "student") {
      studentSubmission = await Submission.findOne({
        assignmentId: id,
        studentId: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment details fetched successfully",
      data: {
        assignment,
        submission: studentSubmission,
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// CREATE ASSIGNMENT
// =====================================
export async function createAssignmentController(req, res, next) {
  try {
    const {
      title,
      description,
      instructions,
      courseId,
      moduleId,
      topicId,
      attachments,
      dueDate,
      totalMarks,
      assignmentType,
      generatedFromDocument,
      rubric,
    } = req.body ?? {};

    if (!title || !courseId || !dueDate) {
      throw new BadRequestError("Title, Course ID and Due Date are required");
    }

    const assignment = await Assignment.create({
      title,
      description: description || "",
      instructions: instructions || "",
      courseId,
      moduleId: moduleId || null,
      topicId: topicId || null,
      attachments: attachments || [],
      dueDate: new Date(dueDate),
      totalMarks: Number(totalMarks) || 100,
      assignmentType: assignmentType || "written",
      generatedFromDocument: !!generatedFromDocument,
      createdBy: req.user._id,
      rubric: rubric || [],
    });

    // Notify clients in real-time
    try {
      emitAssignmentCreated(courseId.toString(), assignment);
    } catch (e) {
      console.error("Socket emit failed in createAssignmentController:", e);
    }

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
export async function updateAssignmentController(req, res, next) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE ASSIGNMENT
// =====================================
export async function deleteAssignmentController(req, res, next) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Cascade delete associated Submissions
    await Submission.deleteMany({ assignmentId: id });

    await Assignment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Assignment and all student submissions permanently deleted",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// AI PDF/DOCUMENT ASSIGNMENT GENERATOR (Parser)
// =====================================
export async function generateAssignmentController(req, res, next) {
  try {
    const { notesText, topicTitle } = req.body ?? {};

    if (!notesText && !topicTitle) {
      throw new BadRequestError("Notes text or Topic title is required for AI question generation");
    }

    const text = (notesText || topicTitle).toLowerCase();
    let generatedQuestions = [];

    // Simulate AI content analysis and draft generation based on topic keywords
    if (text.includes("react") || text.includes("component") || text.includes("hook")) {
      generatedQuestions = [
        {
          type: "mcq",
          question: "Which hook should be used to fetch external API data upon React component mount?",
          options: ["useState", "useMemo", "useEffect", "useCallback"],
          answer: "useEffect",
        },
        {
          type: "short",
          question: "Explain the difference between a controlled and uncontrolled form component in React.",
        },
        {
          type: "code",
          question: "Write a complete custom hook called `useLocalStorage(key, initialValue)` that synced state to LocalStorage.",
        }
      ];
    } else if (text.includes("js") || text.includes("javascript") || text.includes("promise") || text.includes("async")) {
      generatedQuestions = [
        {
          type: "mcq",
          question: "Which of the following describes a closure in JavaScript?",
          options: [
            "A function with no arguments",
            "An inner function retaining access to outer lexical scope variables",
            "A method bound to the global window object",
            "An encrypted JSON token payload"
          ],
          answer: "An inner function retaining access to outer lexical scope variables",
        },
        {
          type: "short",
          question: "Explain the difference between the Event Loop microtask and macrotask queues in JavaScript engine execution.",
        },
        {
          type: "code",
          question: "Implement a polyfill for `Promise.all` that accepts an array of promises and resolves after all of them resolve.",
        }
      ];
    } else if (text.includes("python") || text.includes("django") || text.includes("pandas")) {
      generatedQuestions = [
        {
          type: "mcq",
          question: "In Python, which list-comprehension correctly filters odd numbers from list `x`?",
          options: [
            "[i for i in x if i % 2 == 0]",
            "[i for i in x if i % 2 != 0]",
            "[i in x for i % 2 == 0]",
            "[for i in x: i if i % 2 != 0]"
          ],
          answer: "[i for i in x if i % 2 != 0]",
        },
        {
          type: "short",
          question: "What is the difference between a shallow copy and a deep copy in Python? Detail how `copy` module is applied.",
        },
        {
          type: "code",
          question: "Write a Python generator function `fibonacci(n)` that yields the first `n` numbers in the Fibonacci sequence.",
        }
      ];
    } else {
      // General Fallback
      generatedQuestions = [
        {
          type: "mcq",
          question: "What does REST stand for in web API architecture design?",
          options: [
            "Regional Enterprise Service Token",
            "Representational State Transfer",
            "Reliable Standard Transmission",
            "Realtime Socket Encryption"
          ],
          answer: "Representational State Transfer",
        },
        {
          type: "short",
          question: "Detail the critical security benefits of implementing HTTPS and SSL/TLS handshakes in client-server architecture.",
        },
        {
          type: "code",
          question: "Write a high-performance recursive binary search function that searches for target `k` in a sorted array `arr`.",
        }
      ];
    }

    // Build descriptions & instructions dynamically based on generated questions
    const generatedInstructions = `### Complete all questions inside this sheet.\n\n` + 
      generatedQuestions.map((q, i) => `**Question ${i+1} (${q.type.toUpperCase()}):** ${q.question}`).join("\n\n");

    return res.status(200).json({
      success: true,
      message: "AI Questions draft compiled successfully!",
      data: {
        title: `Assessment: ${topicTitle || "Parsed Document Review"}`,
        description: `This assignment was auto-generated by parsing note materials focusing on key concepts. Check instructions and complete questions.`,
        instructions: generatedInstructions,
        questions: generatedQuestions,
      }
    });
  } catch (err) {
    next(err);
  }
}