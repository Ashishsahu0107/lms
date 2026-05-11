# TODO — RBAC Role Based LMS

## RBAC + ownership enforcement
- [x] Inspect ownership field usage (Course.userId vs instructor) — completed
- [x] Add `authorizeRoles(...)` middleware and teacher owns course guards
- [x] Enforce teacher scope in `backend/routes/courseRoutes.js` for all teacher “manage” operations:
  - [x] add/edit/delete lessons
  - [x] delete course
  - [x] add/remove enrolled users
- [x] Enforce teacher scope in `backend/routes/assignmentRoutes.js`:
  - [x] create assignment only for courses owned by teacher
  - [x] list assignments filtered by role:
    - [x] teacher: only assignments for courses they own
    - [x] student: only assignments for enrolled courses
    - [x] superAdmin: all

- [ ] Keep frontend UI gating but rely on backend for security
- [ ] Run basic manual tests for 3 roles (superAdmin, teacher, student)



