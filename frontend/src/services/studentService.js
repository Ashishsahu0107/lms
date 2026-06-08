import { apiGet, apiPost } from "./apiClient";

// Course APIs
export async function getEnrolledCourses() {
  return apiGet("/student/courses");
}

export async function getCourseDetails(id) {
  return apiGet(`/student/course/${id}`);
}

export async function enrollInCourse(courseId) {
  return apiPost("/student/enroll", { courseId });
}

// Progress APIs
export async function updateProgress(courseId, lectureId) {
  return apiPost("/student/progress", { courseId, lectureId });
}

// Assignment APIs
export async function getAssignments() {
  return apiGet("/student/assignments");
}

export async function submitAssignment(assignmentId, { fileUrl, notes }) {
  return apiPost("/student/assignment/submit", { assignmentId, fileUrl, notes });
}

// Quiz APIs
export async function getQuizzes() {
  return apiGet("/student/quizzes");
}

export async function submitQuiz(quizId, answers, score) {
  return apiPost("/student/quiz/submit", { quizId, answers, score });
}

// Certificate APIs
export async function getCertificate(courseId) {
  return apiGet(`/student/certificate/${courseId}`);
}

// Message APIs
export async function getConversations() {
  return apiGet("/messages/conversations");
}

export async function getMessages(otherId) {
  return apiGet(`/messages/${otherId}`);
}

export async function sendMessage(recipientId, content, attachments = []) {
  return apiPost("/messages/", { recipientId, content, attachments });
}

// Analytics APIs
export async function getStudentAnalytics() {
  return apiGet("/student/analytics");
}

export async function getProgressDetails(courseId) {
  return apiGet(`/student/progress/course/${courseId}`);
}

export async function getStudentAnalyticsInsights() {
  return apiGet("/student/analytics/insights");
}