import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export async function getQuizzes(params = {}) {
  return apiGet("/quizzes", params);
}

export async function getQuizById(id) {
  return apiGet(`/quizzes/${id}`);
}

export async function createQuiz(data) {
  return apiPost("/quizzes", data);
}

export async function updateQuiz(id, data) {
  return apiPut(`/quizzes/${id}`, data);
}

export async function deleteQuiz(id) {
  return apiDelete(`/quizzes/${id}`);
}

export async function getQuizAnalytics(id) {
  return apiGet(`/quizzes/${id}/analytics`);
}

export async function cloneQuiz(id) {
  return apiPost(`/quizzes/${id}/clone`);
}

export async function bulkImportQuestions(id, questions) {
  return apiPost(`/quizzes/${id}/import-questions`, { questions });
}

export async function getQuestionBank() {
  return apiGet("/quizzes/bank/questions");
}
