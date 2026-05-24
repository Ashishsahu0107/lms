import mongoose from "mongoose";

// =====================================
// LECTURE SCHEMA
// =====================================
const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      default: 0,
    },

    isPreview: {
      type: Boolean,
      default: false,
    },

    resources: [
      {
        title: String,
        fileUrl: String,
      },
    ],
  },
  {
    _id: true,
    timestamps: true,
  }
);

// =====================================
// RATING SCHEMA
// =====================================
const ratingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// COURSE SCHEMA
// =====================================
const courseSchema = new mongoose.Schema(
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

    category: {
      type: String,
      default: "",
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================
    // PRICING
    // =====================================
    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    // =====================================
    // MEDIA
    // =====================================
    thumbnail: {
      type: String,
      default: "",
    },

    trailerVideo: {
      type: String,
      default: "",
    },

    // =====================================
    // TEACHER
    // =====================================
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================
    // LECTURES
    // =====================================
    lectures: {
      type: [lectureSchema],
      default: [],
    },

    totalLectures: {
      type: Number,
      default: 0,
    },

    totalDuration: {
      type: Number,
      default: 0,
    },

    // =====================================
    // STUDENTS
    // =====================================
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    totalStudents: {
      type: Number,
      default: 0,
    },

    // =====================================
    // RATINGS
    // =====================================
    ratings: {
      type: [ratingSchema],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalRatings: {
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
        "archived",
      ],
      default: "draft",
      index: true,
    },

    difficulty: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced",
      ],
      default: "beginner",
    },

    // =====================================
    // REALTIME
    // =====================================
    liveClassActive: {
      type: Boolean,
      default: false,
    },

    liveClassRoomId: {
      type: String,
      default: "",
    },

    // =====================================
    // ANALYTICS
    // =====================================
    views: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },

    // =====================================
    // SETTINGS
    // =====================================
    certificateEnabled: {
      type: Boolean,
      default: true,
    },

    commentsEnabled: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
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
courseSchema.index({
  title: "text",
  description: "text",
  category: "text",
});

// Featured Courses
courseSchema.index({
  isFeatured: 1,
});

// =====================================
// PRE SAVE
// =====================================
courseSchema.pre("save", function (next) {

  // Total Lectures
  this.totalLectures =
    this.lectures.length;

  // Total Students
  this.totalStudents =
    this.students.length;

  // Average Rating
  if (this.ratings.length > 0) {

    const total =
      this.ratings.reduce(
        (sum, item) =>
          sum + item.score,
        0
      );

    this.averageRating =
      total / this.ratings.length;

    this.totalRatings =
      this.ratings.length;
  }

  next();
});

// =====================================
// MODEL
// =====================================
export const Course = mongoose.model(
  "Course",
  courseSchema
);