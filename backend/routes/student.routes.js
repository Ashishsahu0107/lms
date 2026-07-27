import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getStudentsController,
  getStudentProgressController,
  getStudentDetailsController,
} from "../controllers/student.controller.js";

const router = Router();

router.use(authenticate, authorize("teacher", "super_admin"));

router.get("/", getStudentsController);
router.get("/progress", getStudentProgressController);
router.get("/:id", getStudentDetailsController);

export default router;
