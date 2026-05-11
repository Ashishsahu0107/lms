import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    // You can modify the response here if needed
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden access
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Resource not found
          console.error('Resource not found:', data.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API Service methods
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => API.post('/auth/login', credentials),
    register: (userData) => API.post('/auth/register', userData),
    logout: () => API.get('/auth/logout'),
    getMe: () => API.get('/auth/me'),
    updateProfile: (profileData) => API.put('/auth/updateprofile', profileData),
    changePassword: (passwordData) => API.put('/auth/changepassword', passwordData),
  },

  // User endpoints
  users: {
    getAll: (params = {}) => API.get('/users', { params }),
    getById: (id) => API.get(`/users/${id}`),
    update: (id, userData) => API.put(`/users/${id}`, userData),
    delete: (id) => API.delete(`/users/${id}`),
    block: (id) => API.put(`/users/block/${id}`),
    unblock: (id) => API.put(`/users/unblock/${id}`),
    updateRole: (id, roleData) => API.put(`/users/role/${id}`, roleData),
    getStats: () => API.get('/users/stats'),
  },

  // Course endpoints
  courses: {
    getAll: (params = {}) => API.get('/courses', { params }),
    getById: (id) => API.get(`/courses/${id}`),
    create: (courseData) => API.post('/courses', courseData),
    update: (id, courseData) => API.put(`/courses/${id}`, courseData),
    delete: (id) => API.delete(`/courses/${id}`),
    enroll: (id) => API.post(`/courses/enroll/${id}`),
    unenroll: (id) => API.delete(`/courses/unenroll/${id}`),
    getTeacherCourses: (params = {}) => API.get('/courses/teacher', { params }),
    getEnrolledCourses: (params = {}) => API.get('/courses/enrolled', { params }),
    getStats: () => API.get('/courses/stats'),
  },

  // Assignment endpoints
  assignments: {
    getAll: (params = {}) => API.get('/assignments', { params }),
    getById: (id) => API.get(`/assignments/${id}`),
    create: (assignmentData) => API.post('/assignments', assignmentData),
    update: (id, assignmentData) => API.put(`/assignments/${id}`, assignmentData),
    delete: (id) => API.delete(`/assignments/${id}`),
    submit: (id, submissionData) => API.post(`/assignments/submit/${id}`, submissionData),
    grade: (id, gradeData) => API.put(`/assignments/grade/${id}`, gradeData),
    getStudentSubmissions: (params = {}) => API.get('/assignments/submissions', { params }),
    getAssignmentSubmissions: (id, params = {}) => API.get(`/assignments/${id}/submissions`, { params }),
  },

  // Analytics endpoints
  analytics: {
    getDashboard: () => API.get('/analytics/dashboard'),
    getRevenue: (params = {}) => API.get('/analytics/revenue', { params }),
    getStudents: (params = {}) => API.get('/analytics/students', { params }),
    getCourses: (params = {}) => API.get('/analytics/courses', { params }),
    getAssignments: (params = {}) => API.get('/analytics/assignments', { params }),
  },

  // File upload helper
  upload: {
    uploadFile: (file, onProgress) => {
      const formData = new FormData();
      formData.append('file', file);

      return API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
    },
  },
};

export default apiService;
