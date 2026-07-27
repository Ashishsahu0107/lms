import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

// ============================================
// ROLE REDIRECTS
// ============================================
const roleRedirects = {
  super_admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

// ============================================
// LOADING SCREEN
// ============================================
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-80 bg-base-100 shadow-2xl">
        <div className="card-body items-center text-center">
          {/* LOADER */}
          <span className="loading loading-spinner loading-lg text-primary"></span>

          <h2 className="mt-4 text-xl font-bold text-base-content">
            Checking Access
          </h2>

          <p className="text-sm text-base-content/60">
            Please wait while we verify your account
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ACCESS DENIED
// ============================================
function AccessDenied({ redirectPath }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md border border-error/20 bg-base-100 shadow-2xl">
        <div className="card-body text-center">
          {/* ICON */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
          </div>

          {/* TEXT */}
          <h2 className="text-2xl font-bold text-base-content">
            Access Denied
          </h2>

          <p className="mt-2 text-sm text-base-content/60">
            You do not have permission to access this page.
          </p>

          {/* BUTTON */}
          <div className="mt-6">
            <a
              href={redirectPath}
              className="btn btn-primary w-full rounded-xl"
            >
              Go To Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ROLE GUARD
// ============================================
export default function RoleGuard({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, isLoading } = useAuth();

  const location = useLocation();

  // ============================================
  // LOADING
  // ============================================
  if (isLoading) {
    return <LoadingScreen />;
  }

  // ============================================
  // NOT AUTHENTICATED
  // ============================================
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ============================================
  // INVALID ROLE
  // ============================================
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <AccessDenied redirectPath={roleRedirects[role] || "/login"} />;
  }

  // ============================================
  // SUCCESS
  // ============================================
  return <>{children}</>;
}
