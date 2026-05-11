# TODO — RBAC Role Based LMS

## RBAC + ownership enforcement
- [ ] Inspect ownership field usage (Course.userId vs instructor) — completed
- [ ] Add `authorizeRoles(...)` middleware and teacher owns course guards
- [ ] Enforce teacher scope in `backend/routes/courseRoutes.js` for all teacher “manage” operations:
  - [ ] add/edit/delete lessons
  - [ ] delete course
  - [ ] add/remove enrolled users
- [x] Enforce teacher scope in `backend/routes/assignmentRoutes.js`:

  - [ ] create assignment only for courses owned by teacher
  - [ ] list assignments filtered by role:
    - [ ] teacher: only assignments for courses they own
    - [ ] student: only assignments for enrolled courses
    - [ ] superAdmin: all

- [ ] Keep frontend UI gating but rely on backend for security
- [ ] Run basic manual tests for 3 roles (superAdmin, teacher, student)


