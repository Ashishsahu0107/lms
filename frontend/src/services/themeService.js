// src/services/themeService.js

const THEME_KEY = "lms_pro_theme";

export const themeService = {
  /**
   * Retrieves the saved theme from localStorage, default is "system"
   * @returns {string}
   */
  getTheme() {
    if (typeof window === "undefined") return "system";
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      return savedTheme || "system";
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
      return "system";
    }
  },

  /**
   * Saves the theme setting in localStorage
   * @param {string} theme 
   */
  setTheme(theme) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error("Error writing theme to localStorage:", e);
    }
  },

  /**
   * Applies the theme to the root element.
   * Uses "luxury" as the default theme name for dark/system-dark mode.
   * @param {string} theme 
   */
  applyTheme(theme) {
    if (typeof window === "undefined") return;
    try {
      const root = document.documentElement;
      
      let activeTheme = theme;
      if (theme === "system") {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        activeTheme = isSystemDark ? "luxury" : "light";
      }

      // Configure Tailwind classes and FlyonUI themes
      root.setAttribute("data-theme", activeTheme);
      
      const darkThemes = ["luxury", "dark", "business"];
      if (darkThemes.includes(activeTheme)) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } catch (e) {
      console.error("Error applying theme to DOM:", e);
    }
  }
};

export default themeService;
