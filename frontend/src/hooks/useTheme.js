// src/hooks/useTheme.js

import { useSelector, useDispatch } from "react-redux";
import { setTheme, toggleTheme } from "../store/themeSlice";

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  // Helper to determine if dark mode is visually active right now
  const isDarkMode = 
    theme === "dark" || 
    theme === "luxury" ||
    theme === "business" ||
    (theme === "system" && 
     typeof window !== "undefined" && 
     window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleSetTheme = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return {
    theme,
    isDarkMode,
    setTheme: handleSetTheme,
    toggleTheme: handleToggleTheme,
  };
}

export default useTheme;
