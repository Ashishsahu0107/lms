import { ROUTES } from "../constants/routes";

export const routesConfig = [
  // Public routes
  { path: ROUTES.LOGIN, name: "Login", public: true },
  { path: ROUTES.REGISTER, name: "Register", public: true },

  // Student routes
  { path: ROUTES.STUDENT_DASHBOARD, name: "Dashboard", roles: ["student"] },
  { path: ROUTES.STUDENT_COURSES, name: "My Courses", roles: ["student"] },
  { path: ROUTES.STUDENT_COURSE_DETAIL, name: "Course Details", roles: ["student"] },
  { path: ROUTES.STUDENT_COURSE_PLAYER, name: "Course Player", roles: ["student"] },
  { path: ROUTES.STUDENT_ASSIGNMENTS, name: "Assignments", roles: ["student"] },
  { path: ROUTES.STUDENT_ASSIGNMENT_DETAIL, name: "Assignment Details", roles: ["student"] },
  { path: ROUTES.STUDENT_QUIZZES, name: "Quizzes", roles: ["student"] },
  { path: ROUTES.STUDENT_MESSAGES, name: "Messages", roles: ["student"] },
  { path: ROUTES.STUDENT_CERTIFICATES, name: "Certificates", roles: ["student"] },
  { path: ROUTES.STUDENT_PROFILE, name: "Profile", roles: ["student"] },
  { path: ROUTES.STUDENT_SETTINGS, name: "Settings", roles: ["student"] },

  // Teacher routes
  { path: ROUTES.TEACHER_DASHBOARD, name: "Dashboard", roles: ["teacher"] },
  { path: ROUTES.TEACHER_COURSES, name: "Courses", roles: ["teacher"] },
  { path: ROUTES.TEACHER_QUIZZES, name: "Quizzes", roles: ["teacher"] },
  { path: ROUTES.TEACHER_ASSIGNMENTS, name: "Assignments", roles: ["teacher"] },
  { path: ROUTES.TEACHER_ASSIGNMENT_DETAIL, name: "Assignment Details", roles: ["teacher"] },
  { path: ROUTES.TEACHER_PROGRESS, name: "Student Progress", roles: ["teacher"] },
  { path: ROUTES.TEACHER_ATTENDANCE, name: "Attendance", roles: ["teacher"] },
  { path: ROUTES.TEACHER_MESSAGES, name: "Messages", roles: ["teacher"] },
  { path: ROUTES.TEACHER_PROFILE, name: "Profile", roles: ["teacher"] },
  { path: ROUTES.TEACHER_CERTIFICATES, name: "Certificates", roles: ["teacher"] },

  // Admin routes
  { path: ROUTES.ADMIN_DASHBOARD, name: "Dashboard", roles: ["super_admin"] },
  { path: ROUTES.ADMIN_USERS, name: "Users", roles: ["super_admin"] },
  { path: ROUTES.ADMIN_CERTIFICATES, name: "Certificates", roles: ["super_admin"] },
];