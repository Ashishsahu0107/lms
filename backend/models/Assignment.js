import mongoose from "mongoose";

// =====================================
// SUBMISSION SCHEMA
// =====================================
const submissionSchema = new mongoose.Schema(
  {
    // =====================================
    // STUDENT
    // =====================================
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================
    // SUBMISSION CONTENT
    // =====================================
    submissionText: {
      type: String,
      default: "",
      trim: true,
    },

    fileUrl: {
      type: String,
      default: "",
    },

    attachments: [
      {
        url: String,
        fileName: String,
        fileType: String,
      },
    ],

    // =====================================
    // GRADING
    // =====================================
    grade: {
      type: Number,
      default: null,
      min: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    obtainedPoints: {
      type: Number,
      default: 0,
    },

    // =====================================
    // STATUS
    // =====================================
    status: {
      type: String,
      enum: [
        "pending",
        "submitted",
        "graded",
        "late",
      ],
      default: "pending",
      index: true,
    },

    // =====================================
    // DATES
    // =====================================
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    gradedAt: {
      type: Date,
      default: null,
    },

    // =====================================
    // REALTIME
    // =====================================
    viewedByTeacher: {
      type: Boolean,
      default: false,
    },

    viewedByStudent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// ASSIGNMENT SCHEMA
// =====================================
const assignmentSchema = new mongoose.Schema(
  {
    // =====================================
    // BASIC INFO
    // =====================================
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
    },

    instructions: {
      type: String,
      default: "",
    },

    // =====================================
    // RELATIONS
    // =====================================
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================
    // FILES
    // =====================================
    fileUrl: {
      type: String,
      default: "",
    },

    attachments: [
      {
        url: String,
        fileName: String,
        fileType: String,
      },
    ],

    // =====================================
    // GRADING
    // =====================================
    totalPoints: {
      type: Number,
      default: 100,
      min: 0,
    },

    passPoints: {
      type: Number,
      default: 40,
    },

    // =====================================
    // DEADLINE
    // =====================================
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },

    allowLateSubmission: {
      type: Boolean,
      default: false,
    },

    latePenalty: {
      type: Number,
      default: 0,
    },

    // =====================================
    // SUBMISSIONS
    // =====================================
    submissions: {
      type: [submissionSchema],
      default: [],
    },

    totalSubmissions: {
      type: Number,
      default: 0,
    },

    gradedSubmissions: {
      type: Number,
      default: 0,
    },

    // =====================================
    // STATUS
    // =====================================
    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "closed",
      ],
      default: "published",
      index: true,
    },

    // =====================================
    // ANALYTICS
    // =====================================
    averageScore: {
      type: Number,
      default: 0,
    },

    // =====================================
    // REALTIME
    // =====================================
    liveSubmissionEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// INDEXES
// =====================================

// Search Optimization
assignmentSchema.index({
  title: "text",
  description: "text",
});


// =====================================
// PRE SAVE
// =====================================
assignmentSchema.pre("save", function (next) {

  // Total Submissions
  this.totalSubmissions =
    this.submissions.length;

  // Graded Count
  this.gradedSubmissions =
    this.submissions.filter(
      (item) =>
        item.status === "graded"
    ).length;

  // Average Score
  const graded =
    this.submissions.filter(
      (item) =>
        item.grade !== null
    );

  if (graded.length > 0) {

    const total =
      graded.reduce(
        (sum, item) =>
          sum + item.grade,
        0
      );

    this.averageScore =
      total / graded.length;
  }

  next();
});

// =====================================
// MODEL
// =====================================
export const Assignment = mongoose.model(
  "Assignment",
  assignmentSchema
);