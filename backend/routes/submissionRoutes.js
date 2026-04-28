import express from "express";
import Submission from "../models/Submission.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= SUBMIT ASSIGNMENT =================
router.post("/:assignmentId", protect, async (req, res) => {
  try {
    const { textAnswer } = req.body;

    // 🔥 duplicate submit check
    const existing = await Submission.findOne({
      user: req.user._id,
      assignment: req.params.assignmentId,
    });

    if (existing) {
      return res.status(400).json({
        msg: "Already submitted",
      });
    }

    const submission = await Submission.create({
      user: req.user._id,
      assignment: req.params.assignmentId,
      textAnswer,
    });

    res.json({
      msg: "Assignment submitted successfully",
      submission,
    });

  } catch (err) {
    console.log("SUBMISSION ERROR:", err);
    res.status(500).json({ msg: "Submission failed" });
  }
});

export default router;