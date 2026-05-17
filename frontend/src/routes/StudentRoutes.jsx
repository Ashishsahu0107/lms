
import RoleGuard from "../components/routeGuard/RoleGuard";
import { ROLES } from "../constants/roles";
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboardPage from "../pages/student/index";

// Route scaffold (not yet wired into app/router.jsx).
export function getStudentRoutes() {
  return [
    {
      path: "/student",
      element: (
        <RoleGuard allowedRoles={[ROLES.STUDENT]}>
          <StudentLayout>
            <StudentDashboardPage />
          </StudentLayout>
        </RoleGuard>
      ),
    },
  ];
}

export default function StudentRoutes() {
  return (
    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
      <StudentLayout>
        <StudentDashboardPage />
      </StudentLayout>
    </RoleGuard>
  );
}

