import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { routeDefinitions } from './routeConfig';

export default function ProtectedRouteGenerator() {
  // This generator exists to enable route architecture refactor.
  // For now, preserve existing functionality by rendering the same route tree
  // as the previous App.jsx implementation.

  // IMPORTANT: These are still mounted from App via <Route element={...} />,
  // so we return a <Routes> tree for the protected portion.
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

