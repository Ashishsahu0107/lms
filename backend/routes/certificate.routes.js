import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  issueCertificateController,
  getStudentCertificatesController,
  getCourseCertificatesController,
  getAllCertificatesController,
  deleteCertificateController,
  getCourseStudentsController,
  verifyCertificateController,
} from "../controllers/certificate.controller.js";

const router = Router();

// Public unauthenticated route for certificate QR validation
router.get("/verify/:certificateId", verifyCertificateController);

// All certificate operations below require authenticated user
router.use(authenticate);

// GET /api/certificates -> Retrieve all certificates (Admin see all, Teacher see own)
router.get(
  "/",
  authorize("super_admin", "teacher"),
  getAllCertificatesController,
);

// POST /api/certificates/issue -> Issue a certificate
router.post(
  "/issue",
  authorize("super_admin", "teacher"),
  issueCertificateController,
);

// GET /api/certificates/student/:id -> Retrieve certificates for specific student
router.get("/student/:id", getStudentCertificatesController);

// GET /api/certificates/course/:courseId -> Retrieve certificates for specific course
router.get(
  "/course/:courseId",
  authorize("super_admin", "teacher"),
  getCourseCertificatesController,
);

// GET /api/certificates/course/:courseId/students -> Retrieve enrolled students for course
router.get(
  "/course/:courseId/students",
  authorize("super_admin", "teacher"),
  getCourseStudentsController,
);

// DELETE /api/certificates/:id -> Revoke certificate (Admin only)
router.delete("/:id", authorize("super_admin"), deleteCertificateController);

export default router;
