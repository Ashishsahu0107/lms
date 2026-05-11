import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";

import Quiz from "../models/Quiz.js";
import Attempt from "../models/Attempt.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });


// ================== 🔥 ATTEMPTS (MUST BE FIRST) ==================
router.get("/attempts", protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(attempts);
  } catch (err) {
    console.log("ATTEMPTS ERROR:", err);
    res.status(500).json({ msg: "Error fetching attempts" });
  }
});


// ================== UPLOAD QUIZ ==================
router.post(
  "/upload",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const filePath = req.file.path;
      const fileType = req.file.mimetype;
      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({ msg: "courseId required" });
      }

      let quizzes = [];

      // JSON
      if (fileType === "application/json") {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        quizzes = data;
      }

      // CSV
      else if (fileType === "text/csv") {
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
              quizzes.push({
                question: row.question,
                options: [
                  row.option1,
                  row.option2,
                  row.option3,
                  row.option4,
                ],
                correct: Number(row.correct),
              });
            })
            .on("end", resolve)
            .on("error", reject);
        });
      }

      else {
        return res.status(400).json({ msg: "Only JSON or CSV allowed" });
      }

      const valid = quizzes
        .filter(
          (q) =>
            q.question &&
            q.options?.length &&
            q.correct !== undefined
        )
        .map((q) => ({
          ...q,
          course: courseId,
        }));

      await Quiz.insertMany(valid);

      fs.unlinkSync(filePath);

      res.json({
        msg: "Quiz uploaded",
        count: valid.length,
      });

    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      res.status(500).json({ msg: "Upload error" });
    }
  }
);


// ================== SUBMIT QUIZ ==================
router.post("/submit/:courseId", protect, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ msg: "Invalid course ID" });
    }

    const quiz = await Quiz.find({
      course: req.params.courseId,
    });

    if (!quiz.length) {
      return res.status(404).json({ msg: "No quiz found" });
    }

    let score = 0;

    quiz.forEach((q) => {
      if (answers[q._id] == q.correct) {
        score++;
      }
    });

    const percent = Math.round((score / quiz.length) * 100);

    // 🔥 SAVE ATTEMPT
    await Attempt.create({
      userId: req.user._id,
      courseId: req.params.courseId,
      score: percent,
      totalQuestions: quiz.length,
      correctAnswers: score,
    });

    res.json({ score: percent });

  } catch (err) {
    console.log("SUBMIT ERROR:", err);
    res.status(500).json({ msg: "Submit error" });
  }
});


// ================== GET QUIZ ==================
router.get("/:courseId", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ msg: "Invalid course ID" });
    }

    const quizzes = await Quiz.find({
      course: req.params.courseId,
    });

    res.json(quizzes);

  } catch (err) {
    console.log("FETCH ERROR:", err);
    res.status(500).json({ msg: "Fetch error" });
  }
});


export default router;