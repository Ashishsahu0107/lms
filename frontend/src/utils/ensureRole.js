import { ROLES } from '../constants/roles';

export function normalizeRole(role) {
  if (!role) return null;
  const r = typeof role === 'string' ? role.toLowerCase() : role;

  // Backend stores role as: superAdmin | teacher | user
  if (r === 'superadmin' || r === ROLES.SUPER_ADMIN.toLowerCase()) return ROLES.SUPER_ADMIN;
  if (r === 'teacher' || r === ROLES.TEACHER.toLowerCase()) return ROLES.TEACHER;
  if (r === 'user' || r === ROLES.STUDENT.toLowerCase()) return ROLES.STUDENT;

  return r;
}

