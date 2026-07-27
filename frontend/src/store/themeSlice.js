// src/store/themeSlice.js

import { createSlice } from "@reduxjs/toolkit";
import themeService from "../services/themeService";

const initialState = {
  theme: themeService.getTheme(),
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload; // 'light' | 'dark' | 'system'
      state.theme = newTheme;
      themeService.setTheme(newTheme);
      themeService.applyTheme(newTheme);
    },
    toggleTheme: (state) => {
      const currentTheme = state.theme;
      const darkThemes = ["luxury", "dark", "business"];
      const isSystemDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isCurrentlyDark =
        darkThemes.includes(currentTheme) ||
        (currentTheme === "system" && isSystemDark);

      const nextTheme = isCurrentlyDark ? "light" : "luxury";
      state.theme = nextTheme;
      themeService.setTheme(nextTheme);
      themeService.applyTheme(nextTheme);
    },
    loadTheme: (state) => {
      const savedTheme = themeService.getTheme();
      state.theme = savedTheme;
      themeService.applyTheme(savedTheme);
    },
  },
});

export const { setTheme, toggleTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;
