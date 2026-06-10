// src/providers/ThemeProvider.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadTheme } from "../store/themeSlice";
import themeService from "../services/themeService";

export function ThemeProvider({ children }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  // Initialize and apply theme on component mount
  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  // Handle real-time OS system color preference changes if theme is set to 'system'
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      themeService.applyTheme("system");
    };

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      // Legacy support
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else {
        // Legacy support
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme]);

  return <>{children}</>;
}

export default ThemeProvider;
