import { apiPost, apiGet, apiDelete } from "./apiClient";

export async function getAiRecommendations() {
  return apiPost("/ai/recommendations");
}

export async function generateAiQuiz(courseId, moduleId, topicId, topic) {
  return apiPost("/ai/generate-quiz", { courseId, moduleId, topicId, topic });
}

export async function aiAssistantChat(prompt) {
  return apiPost("/ai/assistant", { prompt });
}

export async function aiChat(
  prompt,
  courseId,
  moduleId,
  topicId,
  option = "ask",
) {
  return apiPost("/ai/chat", { prompt, courseId, moduleId, topicId, option });
}

export async function aiSummarize(courseId, moduleId, topicId) {
  return apiPost("/ai/summarize", { courseId, moduleId, topicId });
}

export async function aiGenerateNotes(courseId, moduleId, topicId) {
  return apiPost("/ai/generate-notes", { courseId, moduleId, topicId });
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

export async function retryAiChat(chatId) {
  const res = await apiPost(`/ai/chats/${chatId}/retry`);
  return res.data;
}
