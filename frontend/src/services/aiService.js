import { apiPost, apiGet, apiDelete } from "./apiClient";

export async function getAiRecommendations() {
  return apiPost("/ai/recommendations");
}

export async function generateAiQuiz(topic) {
  return apiPost("/ai/generate-quiz", { topic });
}

export async function aiAssistantChat(prompt) {
  return apiPost("/ai/assistant", { prompt });
}

export async function getAiChats() {
  const res = await apiGet("/ai/chats");
  return res.data;
}

export async function createAiChat(title) {
  const res = await apiPost("/ai/chats", { title });
  return res.data;
}

export async function getAiChatDetails(chatId) {
  const res = await apiGet(`/ai/chats/${chatId}`);
  return res.data;
}

export async function deleteAiChat(chatId) {
  const res = await apiDelete(`/ai/chats/${chatId}`);
  return res.data;
}
