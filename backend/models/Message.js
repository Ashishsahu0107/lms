import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video", "file", "audio"],
      default: "file",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const messageSchema = new mongoose.Schema(
  {
    // =====================================
    // USERS
    // =====================================
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatGroup",
      required: false,
      index: true,
    },

    // =====================================
    // MESSAGE CONTENT
    // =====================================
    content: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    attachments: [attachmentSchema],

    // =====================================
    // MESSAGE STATUS
    // =====================================
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    delivered: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },

    // =====================================
    // REALTIME
    // =====================================
    readAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    // =====================================
    // MESSAGE TYPE
    // =====================================
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "system"],
      default: "text",
    },

    // =====================================
    // EDIT SUPPORT
    // =====================================
    edited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// =====================================
// COMPOUND INDEXES
// =====================================

// Conversation Query Optimization
messageSchema.index({
  senderId: 1,
  recipientId: 1,
  createdAt: -1,
});

// Read Messages Optimization
messageSchema.index({
  recipientId: 1,
  read: 1,
});

// Chat Sorting
messageSchema.index({
  createdAt: -1,
});

// =====================================
// VIRTUAL FIELD
// =====================================
messageSchema.virtual("isMedia").get(function () {
  return this.messageType !== "text";
});

// =====================================
// JSON SETTINGS
// =====================================
messageSchema.set("toJSON", {
  virtuals: true,
});

messageSchema.set("toObject", {
  virtuals: true,
});

// =====================================
// MODEL
// =====================================
export const Message = mongoose.model("Message", messageSchema);
