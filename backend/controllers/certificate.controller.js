import { Certificate } from "../models/Certificate.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import crypto from "crypto";

// ======================================================
// POST /api/certificates/issue
// Issue certificate to a student for a completed course
// ======================================================
export async function issueCertificateController(req, res, next) {
  try {
    const { studentId, courseId, templateStyle = "Premium" } = req.body;
    const issuerId = req.user._id;

    if (!studentId || !courseId) {
      throw new BadRequestError("Student ID and Course ID are required");
    }

    // 1. Fetch Course details
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // 2. Validate Ownership if caller is a Teacher
    if (req.user.role === "teacher" && course.teacherId.toString() !== issuerId.toString()) {
      throw new ForbiddenError("Access denied: You can only issue certificates for your own courses");
    }

    // 3. Fetch Enrollment & Student Progress
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      throw new BadRequestError("Student is not enrolled in this course");
    }

    const progressDoc = await StudentProgress.findOne({ studentId, courseId });
    const progressVal = progressDoc ? progressDoc.progress : enrollment.progress || 0;

    // Course completion validation (Require at least 90% progress)
    if (progressVal < 90) {
      throw new BadRequestError(`Student progress (${progressVal}%) is insufficient. Minimum 90% progress required.`);
    }

    // 4. Check if Certificate already exists
    const existingCert = await Certificate.findOne({ student: studentId, course: courseId });
    if (existingCert) {
      throw new BadRequestError("A certificate has already been issued to this student for this course");
    }

    // 5. Generate Unique Certificate ID
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    const courseSlug = course.title
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 4)
      .toUpperCase();
    const certificateId = `CERT-${courseSlug}-${randomHex}`;

    // 6. Create Certificate
    const newCertificate = await Certificate.create({
      student: studentId,
      course: courseId,
      issuedBy: issuerId,
      certificateId,
      completionPercentage: progressVal,
      certificateUrl: `/verify/certificate/${certificateId}`,
      status: "Issued",
    });

    // Populate and return
    const populated = await Certificate.findById(newCertificate._id)
      .populate("student", "name email avatar")
      .populate("course", "title thumbnail")
      .populate("issuedBy", "name role");

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/certificates/student/:id
// Retrieve certificates for a specific student
// ======================================================
export async function getStudentCertificatesController(req, res, next) {
  try {
    const studentId = req.params.id;

    // Students can only view their own certificates
    if (req.user.role === "student" && req.user._id.toString() !== studentId.toString()) {
      throw new ForbiddenError("Access denied: You can only access your own certificates");
    }

    const certificates = await Certificate.find({ student: studentId })
      .populate("student", "name email avatar")
      .populate("course", "title thumbnail teacherId")
      .populate("issuedBy", "name role")
      .sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/certificates/course/:courseId
// Retrieve all certificates issued for a course
// ======================================================
export async function getCourseCertificatesController(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Teachers can only view certificates for their own courses
    if (req.user.role === "teacher" && course.teacherId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied: You can only view certificates for your own courses");
    }

    const certificates = await Certificate.find({ course: courseId })
      .populate("student", "name email avatar")
      .populate("course", "title thumbnail")
      .populate("issuedBy", "name role")
      .sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/certificates
// Retrieve all certificates (Admin see all, Teacher see own)
// ======================================================
export async function getAllCertificatesController(req, res, next) {
  try {
    let query = {};

    if (req.user.role === "teacher") {
      // Find courses taught by this teacher first
      const teacherCourses = await Course.find({ teacherId: req.user._id });
      const courseIds = teacherCourses.map((c) => c._id);
      query.course = { $in: courseIds };
    }

    const certificates = await Certificate.find(query)
      .populate("student", "name email avatar")
      .populate("course", "title thumbnail teacherId")
      .populate("issuedBy", "name role")
      .sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// DELETE /api/certificates/:id
// Revoke/Delete an issued certificate
// ======================================================
export async function deleteCertificateController(req, res, next) {
  try {
    const { id } = req.params;

    // Only Admin can revoke certificates
    if (req.user.role !== "super_admin") {
      throw new ForbiddenError("Access denied: Only Admins can revoke certificates");
    }

    const certificate = await Certificate.findByIdAndDelete(id);
    if (!certificate) {
      throw new NotFoundError("Certificate not found");
    }

    return res.status(200).json({
      success: true,
      message: "Certificate revoked successfully",
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/certificates/course/:courseId/students
// Find enrolled students for a specific teacher-owned course
// ======================================================
export async function getCourseStudentsController(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Secure role-based checks
    if (req.user.role === "teacher" && course.teacherId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied: You can only view students for your own courses");
    }

    const enrollments = await Enrollment.find({ courseId }).populate("studentId", "name email avatar");

    const students = enrollments
      .map((e) => {
        const studentUser = e.studentId || {};
        return {
          _id: studentUser._id,
          name: studentUser.name,
          email: studentUser.email,
          avatar: studentUser.avatar || "",
          profileImage: studentUser.avatar || "",
          progress: e.progress || 0,
        };
      })
      .filter((s) => s._id);

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyCertificateController(req, res, next) {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId })
      .populate("student", "name email avatar")
      .populate("course", "title description thumbnail averageRating totalRatings difficulty duration")
      .populate("issuedBy", "name role");

    if (!cert) {
      throw new NotFoundError("Certificate with the specified ID could not be found or verified.");
    }

    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: cert,
    });
  } catch (err) {
    next(err);
  }
}

