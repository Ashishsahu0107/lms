import flyonui from "flyonui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flyonui/dist/js/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          content: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          content: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#EC4899",
          content: "#FFFFFF",
        },
        neutral: {
          DEFAULT: "#1E293B",
          content: "#F8FAFC",
        },
        "base-100": "#FFFFFF",
        "base-200": "#F8FAFC",
        "base-300": "#E2E8F0",
        "base-content": "#0F172A",
        info: {
          DEFAULT: "#0284C7",
          content: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          content: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          content: "#FFFFFF",
        },
        error: {
          DEFAULT: "#EF4444",
          content: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [flyonui],
};
