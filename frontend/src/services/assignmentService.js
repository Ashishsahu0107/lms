import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export async function getAssignments(params = {}) {
  return apiGet("/assignments", params);
}

export async function getAssignmentById(id) {
  return apiGet(`/assignments/${id}`);
}

export async function createAssignment(data) {
  return apiPost("/assignments", data);
}

export async function updateAssignment(id, data) {
  return apiPut(`/assignments/${id}`, data);
}

export async function deleteAssignment(id) {
  return apiDelete(`/assignments/${id}`);
}

export async function generateAssignmentDraft(data) {
  return apiPost("/assignments/generate", data);
}
