import express from "express";
import Assignment from "../models/Assignment.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Assignment.find();
  res.json(data);
});

router.post("/:id/submit", async (req, res) => {
  const { text } = req.body;

  const assignment = await Assignment.findById(req.params.id);
  assignment.submission = text;
  assignment.status = "Submitted";

  await assignment.save();

  res.json(assignment);
});

export default router;