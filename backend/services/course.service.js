import { Course } from "../models/Course.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

export const courseService = {
  async getCoursesByTeacher(teacherId) {
    return Course.find({ teacherId }).sort({ createdAt: -1 });
  },

  async createCourse(teacherId, data) {
    return Course.create({ ...data, teacherId });
  },

  async updateCourse(courseId, teacherId, updates) {
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new NotFoundError("Course not found");

    Object.assign(course, updates);
    await course.save();
    return course;
  },

  async deleteCourse(courseId, teacherId) {
    const course = await Course.findOneAndDelete({ _id: courseId, teacherId });
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  async getCourseById(courseId, teacherId) {
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  async addLecture(courseId, teacherId, lecture) {
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new NotFoundError("Course not found");

    course.lectures.push(lecture);
    course.totalDuration = course.lectures.reduce((sum, l) => sum + (l.duration || 0), 0);
    await course.save();
    return course;
  },
};