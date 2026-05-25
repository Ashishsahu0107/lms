import { apiPost, apiGet } from "./apiClient";

export async function startAttempt(quizId) {
  return apiPost("/quiz-attempts/start", { quizId });
}

export async function saveAttemptAnswers(attemptId, answers) {
  return apiPost("/quiz-attempts/autosave", { attemptId, answers });
}

export async function submitAttempt(attemptId, { answers, timeSpent }) {
  return apiPost("/quiz-attempts/submit", { attemptId, answers, timeSpent });
}

export async function getQuizAttempts(quizId) {
  return apiGet(`/quiz-attempts/quiz/${quizId}`);
}

export async function getAttemptDetails(attemptId) {
  return apiGet(`/quiz-attempts/single/${attemptId}`);
}
