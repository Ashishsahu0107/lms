export const ROUTES = {
  ROOT: '/',

  LOGIN: '/',
  REGISTER: '/register',

  PUBLIC_COURSES: '/courses',
  PUBLIC_COURSE_DETAIL: '/course/:id',

  STUDENT: {
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    COURSE_DETAIL: '/student/course/:id',
    ASSIGNMENTS: '/student/assignments',
    QUIZ: '/student/quiz',
    ATTENDANCE: '/student/attendance',
    SUPPORT: '/student/support',
    PROFILE: '/student/profile',
    LEADERBOARD: '/student/leaderboard',
  },

  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    COURSES: '/teacher/courses',
    CREATE_COURSE: '/teacher/create-course',
    STUDENTS: '/teacher/students',
    ASSIGNMENTS: '/teacher/assignments',
    UPLOAD_CONTENT: '/teacher/upload-content',
    ANALYTICS: '/teacher/analytics',
    PROFILE: '/teacher/profile',
  },

  SUPERADMIN: {
    DASHBOARD: '/superadmin/dashboard',
    USERS: '/superadmin/users',
    TEACHERS: '/superadmin/teachers',
    COURSES: '/superadmin/courses',
    ANALYTICS: '/superadmin/analytics',
    SETTINGS: '/superadmin/settings',
    LOGS: '/superadmin/logs',
    REPORTS: '/superadmin/reports',
    PROFILE: '/superadmin/profile',
  },

  FALLBACK_UNAUTHORIZED: '/unauthorized',
};

