import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getNotes,
  createNote,
  deleteNote,
} from "../controllers/notes.controller.js";

const router = Router();

// Notes require authentication
router.use(authenticate);

// Student/Teacher/Admin can fetch notes
router.get("/", getNotes);

// Only Teacher and Admin can upload notes
router.post("/", authorize("teacher", "super_admin"), createNote);

// Only Teacher and Admin can delete notes
router.delete("/:id", authorize("teacher", "super_admin"), deleteNote);

export default router;
