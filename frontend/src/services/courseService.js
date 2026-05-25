import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export async function getCourses(params = {}) {
  return apiGet("/courses", params);
}

export async function getCourseById(id) {
  return apiGet(`/courses/${id}`);
}

export async function createCourse(data) {
  return apiPost("/courses", data);
}

export async function updateCourse(id, data) {
  return apiPut(`/courses/${id}`, data);
}

export async function deleteCourse(id) {
  return apiDelete(`/courses/${id}`);
}
