import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    attachments: [
      {
        type: String,
      },
    ],
    resources: [
      {
        title: String,
        fileUrl: String,
      },
    ],
    duration: {
      type: Number,
      default: 0,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Topic = mongoose.model("Topic", topicSchema);
