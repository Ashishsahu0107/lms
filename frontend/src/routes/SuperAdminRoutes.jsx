
import RoleGuard from "../components/routeGuard/RoleGuard";
import { ROLES } from "../constants/roles";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import SuperAdminDashboardPage from "../pages/superadmin/index";



export default function SuperAdminRoutes() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <SuperAdminLayout>
        <SuperAdminDashboardPage />
      </SuperAdminLayout>
    </RoleGuard>
  );
}

