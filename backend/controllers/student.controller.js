import { studentService } from "../services/student.service.js";

// ─── Teacher-facing ──────────────────────────────────────────────────────────
export async function getStudentsController(req, res, next) {
  try {
    const students = await studentService.getStudentsByTeacher(req.user._id);
    res.json(students);
  } catch (err) {
    next(err);
  }
}

export async function getStudentProgressController(req, res, next) {
  try {
    const { courseId } = req.query;
    const progress = await studentService.getStudentProgress(courseId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

export async function getStudentDetailsController(req, res, next) {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentDetails(id);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

// ─── Student-facing ──────────────────────────────────────────────────────────
export async function getEnrolledCoursesController(req, res, next) {
  try {
    const courses = await studentService.getEnrolledCourses(req.user._id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

export async function getCourseDetailsController(req, res, next) {
  try {
    const { id } = req.params;
    const data = await studentService.getCourseDetails(id, req.user._id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function enrollCourseController(req, res, next) {
  try {
    const { courseId } = req.body;
    const course = await studentService.enrollInCourse(req.user._id, courseId);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

export async function updateProgressController(req, res, next) {
  try {
    const { courseId, lectureId } = req.body;
    const progress = await studentService.updateProgress(req.user._id, courseId, lectureId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

export async function submitAssignmentController(req, res, next) {
  try {
    const { assignmentId, fileUrl, notes } = req.body;
    const assignment = await studentService.submitAssignment(req.user._id, assignmentId, { fileUrl, notes });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function submitQuizController(req, res, next) {
  try {
    const { quizId, answers, score } = req.body;
    const quiz = await studentService.submitQuiz(req.user._id, quizId, { answers, score });
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

export async function getCertificateController(req, res, next) {
  try {
    const { courseId } = req.params;
    const cert = await studentService.getCertificate(req.user._id, courseId);
    res.json(cert);
  } catch (err) {
    next(err);
  }
}