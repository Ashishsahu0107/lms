import flyonui from "flyonui";

const flyonColor = (token) =>
  `oklch(from var(--color-${token}) l c h / <alpha-value>)`;

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
          DEFAULT: flyonColor("primary"),
          content: flyonColor("primary-content"),
        },
        secondary: {
          DEFAULT: flyonColor("secondary"),
          content: flyonColor("secondary-content"),
        },
        accent: {
          DEFAULT: flyonColor("accent"),
          content: flyonColor("accent-content"),
        },
        neutral: {
          DEFAULT: flyonColor("neutral"),
          content: flyonColor("neutral-content"),
        },
        "base-100": flyonColor("base-100"),
        "base-200": flyonColor("base-200"),
        "base-300": flyonColor("base-300"),
        "base-content": flyonColor("base-content"),
        info: {
          DEFAULT: flyonColor("info"),
          content: flyonColor("info-content"),
        },
        success: {
          DEFAULT: flyonColor("success"),
          content: flyonColor("success-content"),
        },
        warning: {
          DEFAULT: flyonColor("warning"),
          content: flyonColor("warning-content"),
        },
        error: {
          DEFAULT: flyonColor("error"),
          content: flyonColor("error-content"),
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [flyonui],
};
