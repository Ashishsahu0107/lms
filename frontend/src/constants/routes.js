export const ROUTES = {
  ROOT: "/",

  // Student
  STUDENT_DASHBOARD: "/student/dashboard",
  STUDENT_COURSES: "/student/courses",
  STUDENT_COURSE_DETAIL: "/student/course/:id",
  STUDENT_COURSE_PLAYER: "/student/course/:courseId/player/:lectureId",
  STUDENT_ASSIGNMENTS: "/student/assignments",
  STUDENT_QUIZZES: "/student/quizzes",
  STUDENT_MESSAGES: "/student/messages",
  STUDENT_CERTIFICATES: "/student/certificates",
  STUDENT_PROFILE: "/student/profile",
  STUDENT_SETTINGS: "/student/settings",

  // Teacher
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_COURSES: "/teacher/courses",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
};