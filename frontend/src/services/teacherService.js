import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

// Courses
export async function getTeacherCourses() {
  return apiGet("/teacher/courses");
}

export async function createCourse(data) {
  return apiPost("/teacher/courses", data);
}

export async function updateCourse(id, data) {
  return apiPut(`/teacher/courses/${id}`, data);
}

export async function deleteCourse(id) {
  return apiDelete(`/teacher/courses/${id}`);
}

export async function getCourse(id) {
  return apiGet(`/teacher/courses/${id}`);
}

export async function addLecture(courseId, data) {
  return apiPost(`/teacher/courses/${courseId}/lectures`, data);
}

// Students
export async function getTeacherStudents() {
  return apiGet("/teacher/students");
}

export async function getStudentProgress(courseId) {
  return apiGet("/teacher/students/progress", { courseId });
}

// Assignments
export async function getTeacherAssignments() {
  return apiGet("/teacher/assignments");
}

export async function createAssignment(data) {
  return apiPost("/teacher/assignments", data);
}

export async function updateAssignment(id, data) {
  return apiPut(`/teacher/assignments/${id}`, data);
}

export async function deleteAssignment(id) {
  return apiDelete(`/teacher/assignments/${id}`);
}

export async function gradeSubmission(assignmentId, studentId, grade, feedback) {
  return apiPost(`/teacher/assignments/${assignmentId}/grade`, { studentId, grade, feedback });
}

// Quizzes
export async function getTeacherQuizzes() {
  return apiGet("/teacher/quizzes");
}

export async function createQuiz(data) {
  return apiPost("/teacher/quizzes", data);
}

export async function updateQuiz(id, data) {
  return apiPut(`/teacher/quizzes/${id}`, data);
}

export async function deleteQuiz(id) {
  return apiDelete(`/teacher/quizzes/${id}`);
}

export async function getQuizResults(id) {
  return apiGet(`/teacher/quizzes/${id}/results`);
}

// Analytics
export async function getTeacherAnalytics() {
  return apiGet("/teacher/analytics");
}

// Messages
export async function getConversations() {
  return apiGet("/messages/conversations");
}

export async function getMessages(otherId) {
  return apiGet(`/messages/${otherId}`);
}

export async function sendMessage(data) {
  return apiPost("/messages", data);
}