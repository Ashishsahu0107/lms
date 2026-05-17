import React from "react";

// Preserve current default screen exactly as it currently renders.
// The current App.jsx content is expected to be moved into LegacyApp.
import LegacyApp from "../shared/LegacyApp";

export default function RootScreen() {
  return <LegacyApp />;
}

