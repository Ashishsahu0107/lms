import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { courseService } from "../services/course.service.js";

export async function getCoursesController(req, res, next) {
  try {
    const courses = await courseService.getCoursesByTeacher(req.user._id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

export async function createCourseController(req, res, next) {
  try {
    const { title, description, category, price, thumbnail, status, difficulty, tags } = req.body;
    if (!title) throw new BadRequestError("title is required");

    const course = await courseService.createCourse(req.user._id, {
      title, description, category, price, thumbnail, status, difficulty, tags,
    });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

export async function updateCourseController(req, res, next) {
  try {
    const { id } = req.params;
    const course = await courseService.updateCourse(id, req.user._id, req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

export async function deleteCourseController(req, res, next) {
  try {
    const { id } = req.params;
    await courseService.deleteCourse(id, req.user._id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getCourseByIdController(req, res, next) {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id, req.user._id);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

export async function addLectureController(req, res, next) {
  try {
    const { id } = req.params;
    const course = await courseService.addLecture(id, req.user._id, req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
}