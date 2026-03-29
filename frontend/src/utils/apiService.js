import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  register: (email, password, name) =>
    apiClient.post('/auth/register', { email, password, name }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Course Service
export const courseService = {
  getAllCourses: () => apiClient.get('/courses'),
  getCourseById: (id) => apiClient.get(`/courses/${id}`),
  createCourse: (data) => apiClient.post('/courses', data),
  updateCourse: (id, data) => apiClient.put(`/courses/${id}`, data),
  deleteCourse: (id) => apiClient.delete(`/courses/${id}`),
  getCourseContent: (courseId) => apiClient.get(`/courses/${courseId}/content`),
};

// Enrollment Service
export const enrollmentService = {
  enrollCourse: (courseId) => apiClient.post('/enrollment', { courseId }),
  getEnrollments: () => apiClient.get('/enrollment'),
  getEnrollmentsByUser: (userId) => apiClient.get(`/enrollment/user/${userId}`),
};

// Assignment Service
export const assignmentService = {
  getAssignments: (courseId) => apiClient.get(`/assignments?courseId=${courseId}`),
  getAssignmentById: (id) => apiClient.get(`/assignments/${id}`),
  submitAssignment: (assignmentId, submissionData) =>
    apiClient.post(`/assignments/${assignmentId}/submit`, submissionData),
  getSubmissions: (assignmentId) =>
    apiClient.get(`/assignments/${assignmentId}/submissions`),
};

// Quiz Service
export const quizService = {
  getQuizzes: (courseId) => apiClient.get(`/quizzes?courseId=${courseId}`),
  getQuizById: (id) => apiClient.get(`/quizzes/${id}`),
  submitQuiz: (quizId, answers) =>
    apiClient.post(`/quizzes/${quizId}/submit`, { answers }),
  getQuizResults: (quizId) => apiClient.get(`/quizzes/${quizId}/results`),
};

// Progress Service
export const progressService = {
  getProgress: (userId) => apiClient.get(`/progress/${userId}`),
  updateProgress: (courseId, data) =>
    apiClient.put(`/progress/${courseId}`, data),
  getCompletionStats: (userId) => apiClient.get(`/progress/${userId}/stats`),
};

// User Service
export const userService = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  getUserById: (id) => apiClient.get(`/users/${id}`),
};

export default apiClient;
