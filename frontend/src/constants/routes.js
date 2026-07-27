export const ROUTES = {
  ROOT: "/",

  // Student
  STUDENT_DASHBOARD: "/student/dashboard",
  STUDENT_COURSES: "/student/courses",
  STUDENT_COURSE_DETAIL: "/student/course/:id",
  STUDENT_COURSE_PLAYER: "/student/course/:courseId/player/:lectureId",
  STUDENT_ASSIGNMENTS: "/student/assignments",
  STUDENT_ASSIGNMENT_DETAIL: "/student/assignments/:id",
  STUDENT_QUIZZES: "/student/quizzes",
  STUDENT_MESSAGES: "/student/messages",
  STUDENT_CERTIFICATES: "/student/certificates",
  STUDENT_PROFILE: "/student/profile",
  STUDENT_SETTINGS: "/student/settings",
  STUDENT_ATTENDANCE: "/student/attendance",
  STUDENT_ATTENDANCE_CALENDAR: "/student/attendance/calendar",

  // Teacher
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_COURSES: "/teacher/courses",
  TEACHER_QUIZZES: "/teacher/quizzes",
  TEACHER_ASSIGNMENTS: "/teacher/assignments",
  TEACHER_ASSIGNMENT_DETAIL: "/teacher/assignments/:id",
  TEACHER_PROGRESS: "/teacher/student-progress",
  TEACHER_ATTENDANCE: "/teacher/attendance",
  TEACHER_ATTENDANCE_HISTORY: "/teacher/attendance/history",
  TEACHER_ATTENDANCE_REPORT: "/teacher/attendance/report",
  TEACHER_EARNINGS: "/teacher/earnings",
  TEACHER_MESSAGES: "/teacher/messages",
  TEACHER_PROFILE: "/teacher/profile",
  TEACHER_CERTIFICATES: "/teacher/certificates",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_CERTIFICATES: "/admin/certificates",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
};
