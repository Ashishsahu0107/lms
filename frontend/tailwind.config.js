/** @type {import('tailwindcss').Config} */
import flyonui from "flyonui";

export default {
  darkMode: ["class"],

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flyonui/dist/js/*.js",
  ],

  theme: {
    extend: {

      colors: {
        // ── LUXURY GOLD ──────────────────────
        gold: {
          DEFAULT: "#C9A227",
          light:   "#F59E0B",
          dark:    "#A17510",
          pale:    "rgba(201,162,39,0.15)",
          glow:    "rgba(201,162,39,0.3)",
        },

        // ── TAILWIND CSS VAR TOKENS ──────────
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",

        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",

        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },

        // ── LUXURY PALETTE ────────────────────
        luxury: {
          bg:      "#0F172A",
          card:    "#1E293B",
          border:  "rgba(201,162,39,0.15)",
          gold:    "#C9A227",
          amber:   "#F59E0B",
          text:    "#FFFFFF",
          muted:   "#CBD5E1",
        },
      },

      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      fontFamily: {
        sans:   ["Outfit", "Inter", "system-ui", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        inter:  ["Inter",  "sans-serif"],
      },

      boxShadow: {
        card:          "0 1px 3px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.1)",
        elevated:      "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.15)",
        "gold-glow":   "0 0 20px rgba(201,162,39,0.4), 0 0 60px rgba(201,162,39,0.1)",
        "gold-sm":     "0 0 10px rgba(201,162,39,0.3), 0 4px 15px rgba(201,162,39,0.1)",
        "gold-lg":     "0 0 30px rgba(201,162,39,0.5), 0 0 80px rgba(201,162,39,0.2)",
        "luxury-card": "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,162,39,0.08)",
        "inner-gold":  "inset 0 1px 0 rgba(201,162,39,0.12)",
      },

      backgroundImage: {
        "gold-gradient":       "linear-gradient(135deg, #C9A227 0%, #F59E0B 100%)",
        "gold-gradient-h":     "linear-gradient(90deg, #C9A227 0%, #F59E0B 100%)",
        "luxury-gradient":     "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        "dark-gradient":       "linear-gradient(to bottom right, #0F172A, #0B1220)",
        "card-gradient":       "linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.6) 100%)",
        "hero-gradient":       "linear-gradient(to bottom right, #0F172A, #1E293B, #0F172A)",
        "gold-radial":         "radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)",
        "shimmer":             "linear-gradient(90deg, rgba(201,162,39,0) 0%, rgba(201,162,39,0.12) 50%, rgba(201,162,39,0) 100%)",
      },

      animation: {
        "fade-in":       "fadeIn 0.5s ease-out forwards",
        "slide-up":      "slideUp 0.5s ease-out forwards",
        "slide-down":    "slideDown 0.5s ease-out forwards",
        "scale-in":      "scaleIn 0.3s ease-out forwards",
        "float":         "float 4s ease-in-out infinite",
        "float-slow":    "float 7s ease-in-out infinite",
        "shimmer":       "shimmer 2.5s linear infinite",
        "pulse-gold":    "pulseGold 2s ease-in-out infinite",
        "gold-orb":      "goldOrb 8s ease-in-out infinite",
        "spin-slow":     "spin 4s linear infinite",
        "bounce-slow":   "bounce 3s ease-in-out infinite",
      },

      keyframes: {

        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },

        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },

        slideDown: {
          from: { opacity: "0", transform: "translateY(-24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },

        scaleIn: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },

        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },

        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },

        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,162,39,0.4)" },
          "50%":      { boxShadow: "0 0 0 10px rgba(201,162,39,0)" },
        },

        goldOrb: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.6" },
          "33%":      { transform: "translate(30px,-20px) scale(1.05)", opacity: "0.8" },
          "66%":      { transform: "translate(-20px,15px) scale(0.97)", opacity: "0.5" },
        },
      },

      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        "2xl": "64px",
      },

    },
  },

  plugins: [
    flyonui,
  ],
};