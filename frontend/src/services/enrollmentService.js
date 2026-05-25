import { apiPost, apiGet } from "./apiClient";

export async function assignCourse(studentId, courseId) {
  return apiPost("/enrollments/assign", { studentId, courseId });
}

export async function assignCourseByEmail(email, courseId) {
  return apiPost("/enrollments/assign", { email, courseId });
}

export async function getStudentEnrollments(studentId) {
  return apiGet(`/enrollments/student/${studentId}`);
}

export async function markTopicProgress(courseId, topicId, completed) {
  return apiPost("/enrollments/progress", { courseId, topicId, completed });
}
