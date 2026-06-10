// src/components/common/ThemeToggle.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor, Sparkles, Shield, Briefcase, ChevronUp } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle({ variant = "navbar" }) {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: "light", label: "Light", icon: Sun, color: "text-amber-500", desc: "Clean borders and bright elements." },
    { id: "luxury", label: "Luxury", icon: Sparkles, color: "text-amber-400", desc: "Premium deep dark backdrop with luxury gold accents." },
    { id: "dark", label: "Classic Dark", icon: Moon, color: "text-indigo-400", desc: "Classic dark theme for reduced eye strain." },
    { id: "corporate", label: "Corporate", icon: Shield, color: "text-blue-500", desc: "Professional corporate light theme for business workspaces." },
    { id: "business", label: "Business", icon: Briefcase, color: "text-slate-400", desc: "Sleek dark theme tailored for finance and analytics." },
    { id: "system", label: "System Auto", icon: Monitor, color: "text-emerald-400", desc: "Dynamically tracks your operating system colors." },
  ];

  const currentOption = options.find((opt) => opt.id === theme) || options[1]; // default luxury/system
  const IconComponent = currentOption.icon;

  if (variant === "navbar") {
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-circle border border-base-300/40 hover:bg-base-200/80 transition-all duration-300"
          title="Switch theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <IconComponent className={`h-5 w-5 ${currentOption.color}`} />
            </motion.div>
          </AnimatePresence>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-44 rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-2xl z-50 backdrop-blur-xl"
            >
              {options.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-content shadow-sm"
                        : "hover:bg-base-200 text-base-content/80 hover:text-base-content"
                    }`}
                  >
                    <OptIcon className={`h-4 w-4 ${isSelected ? "text-current" : opt.color}`} />
                    {opt.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-base-300/40 bg-base-200/30 hover:bg-base-200 transition-all duration-200 text-xs font-semibold text-base-content/80"
        >
          <div className="flex items-center gap-2">
            <IconComponent className={`h-4 w-4 shrink-0 ${currentOption.color}`} />
            <span className="truncate">Theme: {currentOption.label}</span>
          </div>
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-base-content/40" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-2xl z-50 backdrop-blur-xl"
            >
              {options.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-content shadow-sm"
                        : "hover:bg-base-200 text-base-content/80 hover:text-base-content"
                    }`}
                  >
                    <OptIcon className={`h-4 w-4 ${isSelected ? "text-current" : opt.color}`} />
                    {opt.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    );
  }

  // settings variant (Grid layout of 6 themes)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map((opt) => {
        const OptIcon = opt.icon;
        const isSelected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              isSelected
                ? "border-primary bg-primary/5 text-base-content shadow-sm"
                : "border-base-300 hover:border-primary/30 text-base-content/80 bg-base-100/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-base-content">{opt.label}</span>
              <OptIcon className={`h-5 w-5 ${isSelected ? "text-primary" : opt.color}`} />
            </div>
            <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
              {opt.desc}
            </p>
            {isSelected && (
              <div className="absolute right-0 bottom-0 w-6 h-6 bg-primary flex items-center justify-center rounded-tl-xl text-primary-content font-bold">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
