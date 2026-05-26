import { apiGet, apiPost, apiDelete } from "./apiClient";

export async function issueCertificate(data) {
  return apiPost("/certificates/issue", data);
}

export async function getStudentCertificates(studentId) {
  return apiGet(`/certificates/student/${studentId}`);
}

export async function getCourseCertificates(courseId) {
  return apiGet(`/certificates/course/${courseId}`);
}

export async function getAllCertificates() {
  return apiGet("/certificates");
}

export async function deleteCertificate(id) {
  return apiDelete(`/certificates/${id}`);
}

export async function getCourseStudents(courseId) {
  return apiGet(`/certificates/course/${courseId}/students`);
}
