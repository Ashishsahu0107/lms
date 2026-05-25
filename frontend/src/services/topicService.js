import { apiPost, apiPut, apiDelete } from "./apiClient";

export async function createTopic(data) {
  return apiPost("/topics", data);
}

export async function updateTopic(id, data) {
  return apiPut(`/topics/${id}`, data);
}

export async function deleteTopic(id) {
  return apiDelete(`/topics/${id}`);
}
