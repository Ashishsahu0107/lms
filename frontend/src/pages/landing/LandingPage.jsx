// Active: 1779901850118@@127.0.0.1@5432@LMS
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  GraduationCap as QuizIcon,
  ClipboardList,
  Clock,
  Award,
  BarChart3,
  Video,
  BrainCircuit,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  Star,
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useAuthModal } from "../../context/AuthModalContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState("student");

  // Scroll to section helper
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className={`min-h-screen font-sans antialiased transition-colors duration-300 relative overflow-x-hidden ${
        isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* ========================================================
         1. LANDING NAVBAR
         ======================================================== */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        isDarkMode ? "border-white/10 bg-slate-950/80 text-white" : "border-slate-200 bg-white/80 text-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent`}>
              LMS PRO
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-xs font-bold hover:text-blue-500 transition">Home</button>
            <button onClick={() => scrollToSection("features")} className="text-xs font-bold hover:text-blue-500 transition">Features</button>
            <button onClick={() => scrollToSection("preview")} className="text-xs font-bold hover:text-blue-500 transition">Dashboards</button>
            <button onClick={() => scrollToSection("courses")} className="text-xs font-bold hover:text-blue-500 transition">Courses</button>
            <button onClick={() => scrollToSection("testimonials")} className="text-xs font-bold hover:text-blue-500 transition">Testimonials</button>
          </div>

          {/* Desktop Right Panel */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition ${
                isDarkMode ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950"
              }`}
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
            </button>

            {user ? (
              <Link to={user.role === "super_admin" ? "/admin/dashboard" : user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"}>
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/15">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <button onClick={openLogin} className="text-xs font-bold px-4 py-2.5 hover:text-blue-500 transition">Sign In</button>
                <button onClick={openRegister} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/15">
                  Register Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition ${
                isDarkMode ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950"
              }`}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 rounded-xl border transition ${
                isDarkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className={`relative w-72 h-full flex flex-col justify-between p-6 border-l shadow-2xl z-10 ${
                isDarkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-white/10">
                  <span className="font-black text-lg bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">LMS Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-white/5 text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-4 text-sm font-bold">
                  <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }} className="text-left hover:text-blue-500">Home</button>
                  <button onClick={() => scrollToSection("features")} className="text-left hover:text-blue-500">Features</button>
                  <button onClick={() => scrollToSection("preview")} className="text-left hover:text-blue-500">Dashboards</button>
                  <button onClick={() => scrollToSection("courses")} className="text-left hover:text-blue-500">Courses</button>
                  <button onClick={() => scrollToSection("testimonials")} className="text-left hover:text-blue-500">Testimonials</button>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-white/10">
                {user ? (
                  <Link to={user.role === "super_admin" ? "/admin/dashboard" : user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} className="block" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg">
                      Dashboard
                    </button>
                  </Link>
                ) : (
                  <>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); openLogin(); }} 
                      className="w-full py-3 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs text-center"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); openRegister(); }} 
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg text-center"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
         2. HERO SECTION
         ======================================================== */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center lg:text-left lg:flex items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-6 lg:max-w-2xl"
        >
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider border ${
            isDarkMode ? "bg-white/5 border-white/5 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
          }`}>
            <Sparkles className="h-3 w-3 fill-current animate-pulse" /> Upgraded Enterprise LMS Suite
          </div>
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>
            Empower Learning. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Master Your Craft.
            </span>
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Welcome to the modern learning experience. Complete with OTP security, unified classroom schedules, Zoom integrations, dynamic Achievements, XP leaderboards, and a dedicated AI Study chatbot.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={openRegister} 
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xl shadow-blue-500/20 flex items-center gap-2 group text-left"
            >
              Get Started Today <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 inline" />
            </button>
            <button onClick={() => scrollToSection("courses")} className={`px-6 py-3.5 rounded-xl font-bold text-xs border transition ${
              isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}>
              Explore Courses
            </button>
          </div>
        </motion.div>

        {/* Dashboard illustration mockup */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 mt-12 lg:mt-0 relative"
        >
          <div className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden ${
            isDarkMode ? "border-white/10 bg-slate-900/50" : "border-slate-200 bg-white"
          }`}>
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
              alt="LMS Dashboard Preview"
              className="w-full rounded-2xl shadow-inner border border-white/5 hover:scale-[1.01] transition duration-500"
            />
            {/* Float badges */}
            <div className={`absolute top-8 left-8 rounded-2xl border p-3 flex items-center gap-2 shadow-lg backdrop-blur animate-float ${
              isDarkMode ? "bg-slate-950/80 border-white/10" : "bg-white border-slate-200"
            }`}>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
              <span className="text-[10px] font-black uppercase text-blue-400">AI Tutor Online</span>
            </div>
            <div className={`absolute bottom-8 right-8 rounded-2xl border p-3 flex items-center gap-2 shadow-lg backdrop-blur animate-float stagger-2 ${
              isDarkMode ? "bg-slate-950/80 border-white/10" : "bg-white border-slate-200"
            }`}>
              <Award className="h-4.5 w-4.5 text-amber-500" />
              <span className="text-[10px] font-black uppercase text-amber-500">Streak Unlocked</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* ========================================================
         3. STATS PANEL
         ======================================================== */}
      <section className={`border-y transition-colors ${isDarkMode ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-100/50"}`}>
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="text-3xl font-extrabold text-blue-500">12K+</h4>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Students</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-indigo-500">450+</h4>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Syllabus Paths</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-purple-500">180+</h4>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">LMS Educators</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-emerald-500">99.2%</h4>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Success Rating</p>
          </div>
        </div>
      </section>

      {/* ========================================================
         4. FEATURES SECTION
         ======================================================== */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Powerful Integrations</Badge>
          <h2 className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>LMS Architecture Core Modules</h2>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Designed from the ground up to offer the ultimate classroom coordination cockpit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Course Management */}
          <div className={`p-6 rounded-3xl border hover:scale-[1.02] transition duration-300 flex flex-col justify-between ${
            isDarkMode ? "bg-white/5 border-white/5 hover:border-blue-500/20" : "bg-white border-slate-200 hover:border-blue-600/20 shadow-sm"
          }`}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4"><BookOpen className="h-5 w-5" /></div>
              <h3 className={`font-bold text-sm mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Course Manager</h3>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Teachers build structured syllabi with dynamic video lessons and downloadable course summaries.</p>
            </div>
            <button onClick={openRegister} className="text-[10px] font-bold text-blue-500 hover:underline mt-4 flex items-center gap-1 text-left">Learn More <ArrowRight className="h-3 w-3 inline" /></button>
          </div>

          {/* Card 2: AI features */}
          <div className={`p-6 rounded-3xl border hover:scale-[1.02] transition duration-300 flex flex-col justify-between ${
            isDarkMode ? "bg-white/5 border-white/5 hover:border-indigo-500/20" : "bg-white border-slate-200 hover:border-indigo-600/20 shadow-sm"
          }`}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4"><BrainCircuit className="h-5 w-5" /></div>
              <h3 className={`font-bold text-sm mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>AI Chat Buddy</h3>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Concept helper, study recommendation engine, and instant biological terms translation desk.</p>
            </div>
            <button onClick={openRegister} className="text-[10px] font-bold text-indigo-500 hover:underline mt-4 flex items-center gap-1 text-left">Learn More <ArrowRight className="h-3 w-3 inline" /></button>
          </div>

          {/* Card 3: Live classes */}
          <div className={`p-6 rounded-3xl border hover:scale-[1.02] transition duration-300 flex flex-col justify-between ${
            isDarkMode ? "bg-white/5 border-white/5 hover:border-purple-500/20" : "bg-white border-slate-200 hover:border-purple-600/20 shadow-sm"
          }`}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4"><Video className="h-5 w-5" /></div>
              <h3 className={`font-bold text-sm mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Live Class Launcher</h3>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Synchronize custom timelines and launch Zoom/Meet classes directly from the schedule timetable.</p>
            </div>
            <button onClick={openRegister} className="text-[10px] font-bold text-purple-500 hover:underline mt-4 flex items-center gap-1 text-left">Learn More <ArrowRight className="h-3 w-3 inline" /></button>
          </div>

          {/* Card 4: Gamification */}
          <div className={`p-6 rounded-3xl border hover:scale-[1.02] transition duration-300 flex flex-col justify-between ${
            isDarkMode ? "bg-white/5 border-white/5 hover:border-emerald-500/20" : "bg-white border-slate-200 hover:border-emerald-600/20 shadow-sm"
          }`}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4"><Award className="h-5 w-5" /></div>
              <h3 className={`font-bold text-sm mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Streaks & XP Levels</h3>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Earn badges, complete quizzes to increase XP score, and compete on student rankings leaderboards.</p>
            </div>
            <button onClick={openRegister} className="text-[10px] font-bold text-emerald-500 hover:underline mt-4 flex items-center gap-1 text-left">Learn More <ArrowRight className="h-3 w-3 inline" /></button>
          </div>
        </div>
      </section>

      {/* ========================================================
         5. DASHBOARD PREVIEW
         ======================================================== */}
      <section id="preview" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Dashboard Telemetry</Badge>
          <h2 className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>Role-Based Cockpit Preview</h2>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Different interfaces tailored specifically for Students, Teachers, and super administrators.</p>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex justify-center gap-3">
          {["student", "teacher", "admin"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePreviewTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition ${
                activePreviewTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/15"
                  : isDarkMode
                  ? "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab} Dashboard
            </button>
          ))}
        </div>

        {/* Tab content illustration */}
        <div className={`p-6 rounded-3xl border shadow-xl flex flex-col lg:flex-row gap-8 items-center ${
          isDarkMode ? "bg-slate-900/40 border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex-1 space-y-5">
            <h3 className={`text-2xl font-black capitalize ${isDarkMode ? "text-white" : "text-slate-800"}`}>{activePreviewTab} Console Overview</h3>
            
            {activePreviewTab === "student" && (
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-blue-500" /> View dynamic study metrics and assignment calendars.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-blue-500" /> Ask the AI Concept tutor questions instantly.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-blue-500" /> Track daily streaks, earn achievements, and compete on ranks.</li>
              </ul>
            )}

            {activePreviewTab === "teacher" && (
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-indigo-500" /> Create rich courses, manage PDF summary resources, and set timelines.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-indigo-500" /> Manage student progress, quizzes, and daily attendances.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-indigo-500" /> Generate student academic certificate credentials.</li>
              </ul>
            )}

            {activePreviewTab === "admin" && (
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-purple-500" /> Check system-wide revenue parameters and billing tracking.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-purple-500" /> Toggle maintenance mode and platform commission rates.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4.5 w-4.5 text-purple-500" /> Execute secure MongoDB cluster backups with single-click triggers.</li>
              </ul>
            )}

            <button 
              onClick={openRegister} 
              className="inline-block mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 group text-left"
            >
              Register to Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 inline" />
            </button>
          </div>

          <div className="flex-1 w-full">
            <div className={`p-3 rounded-2xl border ${isDarkMode ? "border-white/10 bg-slate-950/80" : "border-slate-200 bg-slate-50"}`}>
              {activePreviewTab === "student" && (
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" className="rounded-xl w-full shadow" alt="Student Preview" />
              )}
              {activePreviewTab === "teacher" && (
                <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600" className="rounded-xl w-full shadow" alt="Teacher Preview" />
              )}
              {activePreviewTab === "admin" && (
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600" className="rounded-xl w-full shadow" alt="Admin Preview" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
         6. COURSES SECTION
         ======================================================== */}
      <section id="courses" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Dynamic Syllabus showcase</Badge>
          <h2 className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>Explore Popular Curriculum Paths</h2>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Accelerate your career track with our top-rated academic programs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className={`rounded-3xl border overflow-hidden flex flex-col h-full hover:shadow-xl transition duration-300 ${
            isDarkMode ? "bg-slate-900/40 border-white/10" : "bg-white border-slate-200"
          }`}>
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300" className="w-full h-44 object-cover" alt="Fullstack JavaScript" />
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Programming</span>
                  <span className="flex items-center text-[10px] text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-current mr-0.5" /> 4.9 (2.4K enrolled)</span>
                </div>
                <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-800"}`}>Advanced Full Stack JavaScript</h3>
                <p className={`text-[11px] mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Master React.js, Node.js, Express, MongoDB aggregations, and socket messaging protocols.</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                <span className="text-xs font-black text-blue-500">$99.00</span>
                <button onClick={openRegister} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px]">Enroll Now</button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`rounded-3xl border overflow-hidden flex flex-col h-full hover:shadow-xl transition duration-300 ${
            isDarkMode ? "bg-slate-900/40 border-white/10" : "bg-white border-slate-200"
          }`}>
            <img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300" className="w-full h-44 object-cover" alt="Python & AI" />
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Machine Learning</span>
                  <span className="flex items-center text-[10px] text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-current mr-0.5" /> 4.8 (1.9K enrolled)</span>
                </div>
                <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-800"}`}>Python Fundamentals for AI Architects</h3>
                <p className={`text-[11px] mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Learn object-oriented Python, tensor mechanics, neural grids, and construct predictive APIs.</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                <span className="text-xs font-black text-blue-500">$129.00</span>
                <button onClick={openRegister} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px]">Enroll Now</button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`rounded-3xl border overflow-hidden flex flex-col h-full hover:shadow-xl transition duration-300 ${
            isDarkMode ? "bg-slate-900/40 border-white/10" : "bg-white border-slate-200"
          }`}>
            <img src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=300" className="w-full h-44 object-cover" alt="UI/UX Design" />
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">UI/UX Design</span>
                  <span className="flex items-center text-[10px] text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-current mr-0.5" /> 4.9 (1.1K enrolled)</span>
                </div>
                <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-800"}`}>Advanced UI/UX Product Design</h3>
                <p className={`text-[11px] mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Build interactive wireframes, master typography hierarchy, color variables, and SaaS designs.</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                <span className="text-xs font-black text-blue-500">$79.00</span>
                <button onClick={openRegister} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px]">Enroll Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
         7. TESTIMONIALS SECTION
         ======================================================== */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">User Endorsements</Badge>
          <h2 className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>Student & Teacher Reviews</h2>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>See what members of the LMS Pro community have to say about our platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Review 1 */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 ${
            isDarkMode ? "bg-slate-900/40 border-white/10" : "bg-white border-slate-200"
          }`}>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              "The custom Monthly Timetable calendar and AI Study coach have changed how I organize my studies completely! I went from failing courses to completing full stack paths with a continuous 30-day streak!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">JS</div>
              <div>
                <h4 className={`font-bold text-xs ${isDarkMode ? "text-white" : "text-slate-800"}`}>Jane Student</h4>
                <p className="text-[10px] text-slate-500">Sophomore Learner</p>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 ${
            isDarkMode ? "bg-slate-900/40 border-white/10" : "bg-white border-slate-200"
          }`}>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              "As an educator, I find the course-wise summary note uploads, automatic MCQ quiz builders, and integrated Zoom live class countdowns absolutely unmatched. My administration overhead has literally cut in half!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs">JT</div>
              <div>
                <h4 className={`font-bold text-xs ${isDarkMode ? "text-white" : "text-slate-800"}`}>John Teacher</h4>
                <p className="text-[10px] text-slate-500">Computer Science Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
         8. CTA BANNER SECTION
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">Elevate Your Academics Today</h2>
            <p className="text-sm text-white/80">
              Join thousands of students and teachers already collaborating in our unified LMS environment. Registration takes less than a minute!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button onClick={openRegister} className="px-6 py-3 rounded-xl bg-white text-indigo-600 hover:bg-white/95 font-bold text-xs shadow">
                Join Platform Now
              </button>
              <button onClick={openLogin} className="px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 text-white font-bold text-xs">
                Login Workspace
              </button>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
        </div>
      </section>

      {/* ========================================================
         9. PROFESSIONAL FOOTER
         ======================================================== */}
      <footer className={`border-t py-12 transition-colors ${
        isDarkMode ? "border-white/10 bg-slate-950 text-slate-400" : "border-slate-200 bg-white text-slate-600"
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <span className={`text-md font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent`}>LMS PRO</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Enterprise Suite designed for modern classrooms, comprehensive progress monitoring, and dynamic AI-powered education support.
            </p>
          </div>

          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Platform</h4>
            <div className="flex flex-col gap-2 text-[11px]">
              <button onClick={() => scrollToSection("features")} className="text-left hover:text-blue-500">Features</button>
              <button onClick={() => scrollToSection("preview")} className="text-left hover:text-blue-500">Dashboards</button>
              <button onClick={() => scrollToSection("courses")} className="text-left hover:text-blue-500">Curriculums</button>
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Security</h4>
            <div className="flex flex-col gap-2 text-[11px]">
              <button onClick={openLogin} className="hover:text-blue-500 text-left">OTP Handshake</button>
              <span className="cursor-default">JWT Authentication</span>
              <span className="cursor-default">Role Guards</span>
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Contact Us</h4>
            <p className="text-[11px]">Email: support@lmspro.edu</p>
            <p className="text-[11px] mt-1">Telemetry Status: Active</p>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto px-6 border-t mt-8 pt-6 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 ${
          isDarkMode ? "border-white/5" : "border-slate-100"
        }`}>
          <span>© 2026 LMS PRO Systems Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Small Badge helper
function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${className}`}>
      {children}
    </span>
  );
}
