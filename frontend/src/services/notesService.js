import { apiGet, apiPost, apiDelete } from "./apiClient";

export async function getNotes(courseId) {
  return apiGet("/notes", { courseId });
}

export async function createNote(data) {
  return apiPost("/notes", data);
}

export async function deleteNote(id) {
  return apiDelete(`/notes/${id}`);
}
