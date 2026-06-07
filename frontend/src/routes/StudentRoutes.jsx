
import RoleGuard from "../components/routeGuard/RoleGuard";
import { ROLES } from "../constants/roles";
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboardPage from "../pages/student/index";



export default function StudentRoutes() {
  return (
    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
      <StudentLayout>
        <StudentDashboardPage />
      </StudentLayout>
    </RoleGuard>
  );
}

