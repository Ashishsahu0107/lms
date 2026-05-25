import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =====================================
    // BASIC INFO
    // =====================================
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // =====================================
    // ROLE
    // =====================================
    role: {
      type: String,
      enum: [
        "student",
        "teacher",
        "super_admin",
      ],
      default: "student",
      index: true,
    },

    // =====================================
    // PROFILE
    // =====================================
    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    phone: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
      ],
      default: "other",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    // =====================================
    // STATUS
    // =====================================
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    qualification: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    // =====================================
    // REALTIME STATUS
    // =====================================
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    socketId: {
      type: String,
      default: "",
    },

    // =====================================
    // LMS DETAILS
    // =====================================
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    teachingCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // =====================================
    // SECURITY
    // =====================================
    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // =====================================
    // SETTINGS
    // =====================================
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },

      notifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// INDEXES
// =====================================
userSchema.index({
  isOnline: 1,
});


// =====================================
// REMOVE PASSWORD FROM RESPONSE
// =====================================
userSchema.methods.toJSON = function () {

  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.refreshToken;

  return userObject;
};

// =====================================
// MODEL
// =====================================
export const User = mongoose.model(
  "User",
  userSchema
);