import { useMemo } from "react";

// Scaffold hook. Replace with real auth integration.
export function useAuth() {
  const auth = useMemo(
    () => ({
      user: null,
      role: null,
      isAuthenticated: false,
    }),
    []
  );

  return auth;
}

