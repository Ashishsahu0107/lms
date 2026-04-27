import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import Quiz from "../models/Quiz.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });


// ================== UPLOAD QUIZ ==================
router.post(
  "/upload",
  authMiddleware,
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

      // ✅ JSON
      if (fileType === "application/json") {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        quizzes = data;
      }

      // ✅ CSV
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
                // 🔥 FIX: correct index
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

      // 🔥 VALIDATION + attach course
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
      console.log(err);
      res.status(500).json({ msg: "Upload error" });
    }
  }
);


// ================== GET QUIZ ==================
router.get("/:courseId", authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      course: req.params.courseId,
    });

    res.json(quizzes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Fetch error" });
  }
});


// ================== SUBMIT QUIZ ==================
router.post("/submit/:courseId", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.find({
      course: req.params.courseId,
    });

    let score = 0;

    quiz.forEach((q) => {
      if (answers[q._id] == q.correct) {
        score++;
      }
    });

    const percent = Math.round((score / quiz.length) * 100);

    res.json({ score: percent });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Submit error" });
  }
});

export default router;