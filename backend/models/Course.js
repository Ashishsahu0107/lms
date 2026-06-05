import mongoose from "mongoose";

// =====================================
// RATING SCHEMA
// =====================================
const ratingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      maxlength: 1000,
      trim: true,
    },
  },
  { timestamps: true }
);

// =====================================
// COURSE SCHEMA
// =====================================
const courseSchema = new mongoose.Schema(
  {
    // ── Identity
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    // ── Classification
    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    difficulty: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Difficulty must be beginner, intermediate, or advanced",
      },
      default: "beginner",
      index: true,
    },

    // ── Pricing
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },

    // ── Media — thumbnail stores the public URL served by Express static
    thumbnail: {
      type: String,
      default: "",
    },

    // thumbnailKey stores the filename on disk so we can delete the old file
    // when a new thumbnail is uploaded during an update
    thumbnailKey: {
      type: String,
      default: "",
      select: false, // never sent to clients
    },

    // ── Duration in minutes (integer)
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },

    // ── Relations
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Legacy alias kept for backward compat — synced via pre-validate hook
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ── Ratings aggregate
    ratings: {
      type: [ratingSchema],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Status
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Status must be draft, published, or archived",
      },
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound indexes
courseSchema.index({ teacherId: 1, status: 1 });
courseSchema.index({ status: 1, createdAt: -1 });

// ── Full-text search across title, description, category, tags
courseSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});

// ── Sync teacherId <-> teacher aliases
courseSchema.pre("validate", function (next) {
  if (this.teacherId && !this.teacher) this.teacher = this.teacherId;
  else if (this.teacher && !this.teacherId) this.teacherId = this.teacher;
  next();
});

// ── Recompute rating aggregates before every save
courseSchema.pre("save", function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const total = this.ratings.reduce((sum, r) => sum + r.score, 0);
    this.averageRating = parseFloat((total / this.ratings.length).toFixed(2));
    this.totalRatings = this.ratings.length;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }
  next();
});

export const Course = mongoose.model("Course", courseSchema);