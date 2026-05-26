import { apiPost } from "./apiClient";

export async function getAiRecommendations() {
  return apiPost("/ai/recommendations");
}

export async function generateAiQuiz(topic) {
  return apiPost("/ai/generate-quiz", { topic });
}

export async function aiAssistantChat(prompt) {
  return apiPost("/ai/assistant", { prompt });
}
