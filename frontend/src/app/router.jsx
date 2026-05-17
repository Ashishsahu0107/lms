import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import RootScreen from "../screens/RootScreen";

import { ROUTES } from "../constants/routes";

const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <RootScreen />,
  },
  // Placeholder: role-based home redirect scaffold
  {
    path: ROUTES.DASHBOARD,
    element: <Navigate to={ROUTES.ROOT} replace />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

export { router };

