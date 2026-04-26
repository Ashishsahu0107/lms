    import express from "express";
import Doubt from "../models/Doubt.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const doubt = new Doubt(req.body);
  await doubt.save();

  res.json({ msg: "Doubt submitted" });
});

export default router;