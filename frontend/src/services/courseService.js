import client from "./apiClient";

// ──────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────

/**
 * Build a FormData object from a plain course data object.
 * When a File is present as `data.thumbnailFile`, it is appended as multipart.
 * All other fields are appended as strings so the backend can parse req.body.
 *
 * @param {object} data  — course fields
 * @returns {FormData}
 */
function buildCourseFormData(data) {
  const fd = new FormData();

  const { thumbnailFile, tags, ...rest } = data;

  // Scalar fields
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  });

  // Tags: send as comma-separated string — backend parseTags() handles both
  if (Array.isArray(tags)) {
    fd.append("tags", tags.join(","));
  } else if (tags !== undefined && tags !== null) {
    fd.append("tags", String(tags));
  }

  // File (optional)
  if (thumbnailFile instanceof File) {
    fd.append("thumbnail", thumbnailFile);
  }

  return fd;
}

// ──────────────────────────────────────────────────────────
// COURSE SERVICE API
// ──────────────────────────────────────────────────────────

/**
 * Fetch all courses visible to the current user.
 * @param {object} params  — optional query params: { category, search, status, difficulty }
 */
export async function getCourses(params = {}) {
  return client.get("/courses", { params });
}

/**
 * Fetch a single course by ID (deeply populated).
 * @param {string} id
 */
export async function getCourseById(id) {
  return client.get(`/courses/${id}`);
}

/**
 * Create a new course. Sends multipart/form-data when a thumbnail file is present.
 *
 * @param {object} data  — course fields including optional `thumbnailFile: File`
 */
export async function createCourse(data) {
  const fd = buildCourseFormData(data);
  return client.post("/courses", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * Update an existing course. Sends multipart/form-data when a new thumbnail file is present.
 *
 * @param {string} id
 * @param {object} data  — partial course fields including optional `thumbnailFile: File`
 */
export async function updateCourse(id, data) {
  const fd = buildCourseFormData(data);
  return client.put(`/courses/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * Delete a course (cascades modules, topics, enrollments).
 * @param {string} id
 */
export async function deleteCourse(id) {
  return client.delete(`/courses/${id}`);
}
