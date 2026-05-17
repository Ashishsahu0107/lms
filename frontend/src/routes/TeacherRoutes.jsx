
import RoleGuard from "../components/routeGuard/RoleGuard";
import { ROLES } from "../constants/roles";
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/teacher/index";

// Route scaffold (not yet wired into app/router.jsx).
export function getTeacherRoutes() {
  return [
    {
      path: "/teacher",
      element: (
        <RoleGuard allowedRoles={[ROLES.TEACHER]}>
          <TeacherLayout>
            <TeacherDashboardPage />
          </TeacherLayout>
        </RoleGuard>
      ),
    },
  ];
}

export default function TeacherRoutes() {
  return (
    <RoleGuard allowedRoles={[ROLES.TEACHER]}>
      <TeacherLayout>
        <TeacherDashboardPage />
      </TeacherLayout>
    </RoleGuard>
  );
}

