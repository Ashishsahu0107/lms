export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  TEACHER: 'teacher',
  STUDENT: 'user',
};

export const ROLE_REDIRECTS = {
  [ROLES.SUPER_ADMIN]: '/superadmin/dashboard',
  [ROLES.TEACHER]: '/teacher/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
};

