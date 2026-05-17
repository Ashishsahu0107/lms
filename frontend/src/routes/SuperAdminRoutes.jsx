
import RoleGuard from "../components/routeGuard/RoleGuard";
import { ROLES } from "../constants/roles";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import SuperAdminDashboardPage from "../pages/superadmin/index";

// Route scaffold (not yet wired into app/router.jsx).
export function getSuperAdminRoutes() {
  return [
    {
      path: "/superadmin",
      element: (
        <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
          <SuperAdminLayout>
            <SuperAdminDashboardPage />
          </SuperAdminLayout>
        </RoleGuard>
      ),
    },
  ];
}

export default function SuperAdminRoutes() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <SuperAdminLayout>
        <SuperAdminDashboardPage />
      </SuperAdminLayout>
    </RoleGuard>
  );
}

