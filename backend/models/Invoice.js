import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    billingDetails: {
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    pdfUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
