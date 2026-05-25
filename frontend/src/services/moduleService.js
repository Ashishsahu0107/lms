import { apiPost, apiPut, apiDelete } from "./apiClient";

export async function createModule(data) {
  return apiPost("/modules", data);
}

export async function updateModule(id, data) {
  return apiPut(`/modules/${id}`, data);
}

export async function deleteModule(id) {
  return apiDelete(`/modules/${id}`);
}
