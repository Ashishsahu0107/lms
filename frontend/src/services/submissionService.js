import { apiPost, apiGet, apiPut } from "./apiClient";

export async function submitAssignment(data) {
  return apiPost("/submissions", data);
}

export async function getAssignmentSubmissions(assignmentId) {
  return apiGet(`/submissions/${assignmentId}`);
}

export async function getSubmissionById(submissionId) {
  return apiGet(`/submissions/single/${submissionId}`);
}

export async function gradeSubmission(submissionId, data) {
  return apiPut(`/submissions/${submissionId}/review`, data);
}

