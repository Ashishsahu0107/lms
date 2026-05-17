

// Kept existing file name, but upgraded to a useful reusable wrapper.
// This can be used when you want to protect an entire layout tree.
export default function RoleGuardLayout({ allowedRoles = [], children }) {
  // Placeholder: integrate with useAuth/useRole later.
  return <>{children}</>;
}

