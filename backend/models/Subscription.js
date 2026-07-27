import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    durationMonths: {
      type: Number,
      default: 1,
    },
    benefits: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
