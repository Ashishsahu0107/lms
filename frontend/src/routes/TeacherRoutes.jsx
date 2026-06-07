import RoleGuard from "../components/routeGuard/RoleGuard";
import { ROLES } from "../constants/roles";
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/teacher/index";

export default function TeacherRoutes() {
  return (
    <RoleGuard allowedRoles={[ROLES.TEACHER]}>
      <TeacherLayout>
        <TeacherDashboardPage />
      </TeacherLayout>
    </RoleGuard>
  );
}

