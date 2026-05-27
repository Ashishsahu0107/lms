import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      default: "user",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },
    messages: [aiMessageSchema],
  },
  {
    timestamps: true,
  }
);

export const AIChat = mongoose.model("AIChat", aiChatSchema);
