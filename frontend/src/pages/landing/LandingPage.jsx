// src/pages/landing/LandingPage.jsx — LUXURY GOLD EDITION

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ClipboardList,
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
  Shield,
  Zap,
  Play,
  ChevronDown,
  ChevronUp,
  Crown,
  Gem,
  Globe,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useAuthModal } from "../../context/AuthModalContext";

// ─────────────────────────────────────
// GOLD COLOR CONSTANTS
// ─────────────────────────────────────
const GOLD = "#C9A227";
const GOLD_LIGHT = "#F59E0B";
const DARK_BG = "#0F172A";
const CARD_BG = "#1E293B";

// ─────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ─────────────────────────────────────
// FEATURES DATA
// ─────────────────────────────────────
const features = [
  {
    icon: BookOpen,
    title: "Course Manager",
    desc: "Build structured syllabi with dynamic video lessons, PDF summaries, and progress tracking.",
    accent: GOLD,
    delay: 0,
  },
  {
    icon: BrainCircuit,
    title: "AI Study Buddy",
    desc: "Concept helper, study recommendations, and instant explanations powered by AI.",
    accent: "#818CF8",
    delay: 0.1,
  },
  {
    icon: Video,
    title: "Live Classes",
    desc: "Launch Zoom/Meet sessions directly from your schedule with countdown timers.",
    accent: "#34D399",
    delay: 0.2,
  },
  {
    icon: Award,
    title: "XP & Streaks",
    desc: "Gamified learning with badges, XP levels, leaderboards, and daily streak rewards.",
    accent: GOLD_LIGHT,
    delay: 0.3,
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "OTP email verification, JWT authentication, and role-based access control.",
    accent: "#F472B6",
    delay: 0.4,
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    desc: "Real-time dashboards with charts for student progress, revenue, and engagement.",
    accent: "#22D3EE",
    delay: 0.5,
  },
  {
    icon: ClipboardList,
    title: "Smart Assignments",
    desc: "Create, assign, submit, and grade assignments with file uploads and rubrics.",
    accent: "#A78BFA",
    delay: 0.6,
  },
  {
    icon: Globe,
    title: "Multi-Role Platform",
    desc: "Separate dashboards for Students, Teachers, and Admins with tailored workflows.",
    accent: GOLD,
    delay: 0.7,
  },
];

// ─────────────────────────────────────
// COURSES DATA
// ─────────────────────────────────────
const courses = [
  {
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    tag: "Programming",
    tagColor: GOLD,
    title: "Advanced Full Stack JavaScript",
    desc: "Master React.js, Node.js, Express, MongoDB, and real-time socket communications.",
    rating: 4.9,
    students: "2.4K",
    price: "$99",
  },
  {
    img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80",
    tag: "Machine Learning",
    tagColor: "#818CF8",
    title: "Python Fundamentals for AI",
    desc: "Learn tensor mechanics, neural networks, and build predictive ML APIs from scratch.",
    rating: 4.8,
    students: "1.9K",
    price: "$129",
  },
  {
    img: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80",
    tag: "UI/UX Design",
    tagColor: "#F472B6",
    title: "Advanced UI/UX Product Design",
    desc: "Build interactive wireframes, master typography, color theory, and SaaS design systems.",
    rating: 4.9,
    students: "1.1K",
    price: "$79",
  },
];

// ─────────────────────────────────────
// PRICING DATA
// ─────────────────────────────────────
const pricing = [
  {
    name: "Starter",
    icon: Zap,
    price: "Free",
    sub: "forever",
    desc: "Perfect for individuals getting started",
    features: [
      "5 Courses Access",
      "Basic Analytics",
      "Community Support",
      "Mobile App",
      "OTP Security",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Professional",
    icon: Crown,
    price: "$49",
    sub: "per month",
    desc: "For serious learners and growing teams",
    features: [
      "Unlimited Courses",
      "AI Study Buddy",
      "Live Classes",
      "Advanced Analytics",
      "Certificate Generation",
      "Priority Support",
      "Custom Assignments",
    ],
    cta: "Start Pro Trial",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    icon: Gem,
    price: "$199",
    sub: "per month",
    desc: "For large institutions and organizations",
    features: [
      "Everything in Pro",
      "White-label Branding",
      "Custom Integrations",
      "Dedicated Manager",
      "SLA Guarantee",
      "Bulk User Import",
      "API Access",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

// ─────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────
const testimonials = [
  {
    quote:
      "The AI Study coach and Monthly Timetable completely transformed how I organize my studies. Went from failing to a 30-day streak!",
    name: "Jane Okafor",
    role: "Computer Science Student",
    stars: 5,
    initials: "JO",
    gradient: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
  },
  {
    quote:
      "The course summary uploads, MCQ quiz builder, and Zoom countdowns cut my admin work in half. Absolutely unmatched for educators.",
    name: "Dr. John Matthews",
    role: "Computer Science Instructor",
    stars: 5,
    initials: "JM",
    gradient: "linear-gradient(135deg, #818CF8, #6366F1)",
  },
  {
    quote:
      "Our institution saw a 40% improvement in student engagement within the first month of using LMS PRO. The gamification is genius.",
    name: "Sarah Chen",
    role: "Academic Director",
    stars: 5,
    initials: "SC",
    gradient: "linear-gradient(135deg, #34D399, #059669)",
  },
  {
    quote:
      "Finally a platform that feels premium. The analytics dashboard gives me everything I need to track and improve student outcomes.",
    name: "Michael Torres",
    role: "Senior Teacher",
    stars: 5,
    initials: "MT",
    gradient: "linear-gradient(135deg, #F472B6, #EC4899)",
  },
];

// ─────────────────────────────────────
// FAQ DATA
// ─────────────────────────────────────
const faqs = [
  {
    q: "How does the AI Study Buddy work?",
    a: "Our AI chatbot is powered by advanced language models. It helps students understand concepts, generates quiz questions, recommends study paths, and explains complex topics in simple language — all in real time.",
  },
  {
    q: "Can I use LMS PRO for my entire institution?",
    a: "Absolutely. Our Enterprise plan supports unlimited teachers, students, and courses. You get a dedicated account manager, white-label branding, custom integrations, and SLA-backed uptime guarantees.",
  },
  {
    q: "How does certificate generation work?",
    a: "Teachers can issue digitally-signed certificates to students upon course completion. Students can download PDF certificates and share them on LinkedIn. Admins can manage certificate templates and bulk-issue.",
  },
  {
    q: "Is my data secure on LMS PRO?",
    a: "Yes. We use 256-bit SSL encryption, JWT-based authentication, OTP email verification, and role-based access control. Your data is stored in encrypted MongoDB clusters with daily automated backups.",
  },
  {
    q: "Can I integrate Zoom or Google Meet for live classes?",
    a: "Yes! Teachers can schedule live classes with Zoom or Google Meet links directly from the Schedule Manager. Students see live countdown timers and get notified when a class is about to start.",
  },
  {
    q: "What's included in the free plan?",
    a: "The free plan includes access to 5 courses, basic analytics, OTP security, mobile app access, and community support. It's perfect for trying out the platform before upgrading.",
  },
];

// ─────────────────────────────────────
// STATS
// ─────────────────────────────────────
const stats = [
  { value: "12K+", label: "Active Students", color: GOLD },
  { value: "450+", label: "Syllabus Paths", color: "#818CF8" },
  { value: "180+", label: "Expert Educators", color: "#34D399" },
  { value: "99.2%", label: "Success Rating", color: GOLD_LIGHT },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Courses", id: "courses" },
    { label: "Pricing", id: "pricing" },
    { label: "Testimonials", id: "testimonials" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <div
      className="min-h-screen font-sans antialiased overflow-x-hidden"
      style={{ background: DARK_BG, color: "#FFFFFF" }}
    >
      {/* ══════════════════════════════════════
          ANIMATED BACKGROUND ORBS (GLOBAL)
      ══════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`,
            filter: "blur(80px)",
            animation: "goldOrb 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #818CF8 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-6"
          style={{
            background: `radial-gradient(circle, ${GOLD_LIGHT} 0%, transparent 70%)`,
            filter: "blur(90px)",
            animation: "float 14s ease-in-out 3s infinite",
          }}
        />
      </div>

      {/* ══════════════════════════════════════
          1. NAVBAR
      ══════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(15,23,42,0.92)" : "rgba(15,23,42,0.6)",
          backdropFilter: "blur(24px)",
          borderBottom: scrolled
            ? "1px solid rgba(201,162,39,0.15)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:shadow-gold-sm"
              style={{
                background: "linear-gradient(135deg, #C9A227, #F59E0B)",
              }}
            >
              <GraduationCap className="h-5 w-5 text-slate-950" />
            </div>
            <span
              className="text-xl font-black tracking-tight"
              style={{ color: GOLD }}
            >
              LMS <span className="text-white">PRO</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                  style={{ background: GOLD }}
                />
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" style={{ color: GOLD }} />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>

            {user ? (
              <Link
                to={
                  user.role === "super_admin"
                    ? "/admin/dashboard"
                    : user.role === "teacher"
                      ? "/teacher/dashboard"
                      : "/student/dashboard"
                }
              >
                <button
                  className="px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                    color: "#0F172A",
                    boxShadow: "0 4px 15px rgba(201,162,39,0.3)",
                  }}
                >
                  My Dashboard
                </button>
              </Link>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Sign In
                </button>
                <button
                  onClick={openRegister}
                  className="px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-gold-sm"
                  style={{
                    background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                    color: "#0F172A",
                    boxShadow: "0 4px 15px rgba(201,162,39,0.3)",
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" style={{ color: GOLD }} />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Menu className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 h-full w-72 flex flex-col p-6"
              style={{
                background: "#0F172A",
                borderLeft: "1px solid rgba(201,162,39,0.15)",
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-black text-lg" style={{ color: GOLD }}>
                  Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="text-left py-3 px-4 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <div
                className="space-y-3 pt-4 border-t"
                style={{ borderColor: "rgba(201,162,39,0.1)" }}
              >
                {user ? (
                  <Link
                    to={
                      user.role === "super_admin"
                        ? "/admin/dashboard"
                        : user.role === "teacher"
                          ? "/teacher/dashboard"
                          : "/student/dashboard"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button
                      className="w-full py-3 rounded-full font-bold text-sm text-center"
                      style={{
                        background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                        color: "#0F172A",
                      }}
                    >
                      My Dashboard
                    </button>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openLogin();
                      }}
                      className="w-full py-3 rounded-full font-bold text-sm text-center border"
                      style={{
                        borderColor: "rgba(201,162,39,0.3)",
                        color: GOLD,
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openRegister();
                      }}
                      className="w-full py-3 rounded-full font-bold text-sm text-center"
                      style={{
                        background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                        color: "#0F172A",
                      }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          2. HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Copy */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex-1 max-w-2xl text-center lg:text-left"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(201,162,39,0.12)",
                border: "1px solid rgba(201,162,39,0.25)",
                color: GOLD,
              }}
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Upgraded Enterprise LMS Suite · 2026
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Empower Learning. <br className="hidden sm:block" />
              <span
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Master Every Craft.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
            >
              The modern learning platform with OTP security, AI Study Buddy,
              Zoom integrations, dynamic gamification, XP leaderboards — built
              for enterprise scale.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={openRegister}
                className="px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 group transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                  color: "#0F172A",
                  boxShadow: "0 4px 25px rgba(201,162,39,0.4)",
                }}
              >
                Start Learning Today
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollTo("courses")}
                className="px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <Play className="h-4 w-4" />
                Explore Courses
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex items-center gap-6 justify-center lg:justify-start"
            >
              {[
                { icon: Shield, label: "SSL Secured" },
                { icon: Users, label: "12K+ Learners" },
                { icon: Star, label: "4.9/5 Rated" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" style={{ color: GOLD }} />
                  <span className="text-xs font-semibold text-slate-400">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 relative"
          >
            <div
              className="relative rounded-3xl p-3 overflow-hidden"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(201,162,39,0.2)",
                boxShadow:
                  "0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,162,39,0.08)",
                backdropFilter: "blur(16px)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=90"
                alt="LMS Dashboard Preview"
                className="w-full rounded-2xl transition-transform duration-700 hover:scale-[1.01]"
                style={{ filter: "brightness(0.85) contrast(1.1)" }}
              />
              {/* Floating Badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(201,162,39,0.3)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ background: GOLD }}
                />
                <span
                  className="text-xs font-black uppercase tracking-wide"
                  style={{ color: GOLD }}
                >
                  AI Tutor Active
                </span>
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Award className="h-4 w-4" style={{ color: GOLD_LIGHT }} />
                <span
                  className="text-xs font-black uppercase tracking-wide"
                  style={{ color: GOLD_LIGHT }}
                >
                  Streak Unlocked 🔥
                </span>
              </motion.div>
            </div>
            {/* Glow under card */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-16 rounded-full opacity-30 blur-xl"
              style={{
                background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. STATS STRIP
      ══════════════════════════════════════ */}
      <section
        className="relative z-10 py-12 border-y"
        style={{
          borderColor: "rgba(201,162,39,0.1)",
          background: "rgba(30,41,59,0.3)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {stats.map(({ value, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-4xl font-black mb-1" style={{ color }}>
                {value}
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          4. FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(201,162,39,0.1)",
                border: "1px solid rgba(201,162,39,0.2)",
                color: GOLD,
              }}
            >
              Platform Modules
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Designed from the ground up to offer the ultimate classroom
              coordination cockpit for students, teachers, and administrators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: f.delay }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="p-6 rounded-3xl flex flex-col gap-4 cursor-default transition-all duration-300 group"
                  style={{
                    background: "rgba(30,41,59,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(16px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = `1px solid ${f.accent}30`;
                    e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${f.accent}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                    style={{ background: `${f.accent}18` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: f.accent }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  <button
                    onClick={openRegister}
                    className="text-xs font-bold flex items-center gap-1 mt-auto transition-all duration-200 hover:gap-2"
                    style={{ color: f.accent }}
                  >
                    Learn More <ArrowRight className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. DASHBOARD PREVIEW TABS
      ══════════════════════════════════════ */}
      <section
        id="preview"
        className="relative z-10 py-24 px-6"
        style={{ background: "rgba(30,41,59,0.2)" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 max-w-2xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(129,140,248,0.1)",
                border: "1px solid rgba(129,140,248,0.2)",
                color: "#818CF8",
              }}
            >
              Role-Based Dashboards
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Three Powerful Cockpits
            </h2>
            <p className="text-slate-400">
              Different interfaces tailored specifically for each user role.
            </p>
          </motion.div>

          <div className="flex justify-center gap-2 mb-10">
            {["student", "teacher", "admin"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300"
                style={
                  activeTab === tab
                    ? {
                        background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                        color: "#0F172A",
                        boxShadow: "0 4px 15px rgba(201,162,39,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#94A3B8",
                      }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl p-8 flex flex-col lg:flex-row gap-10 items-center"
              style={{
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(201,162,39,0.12)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex-1 space-y-6">
                <h3 className="text-3xl font-black text-white capitalize">
                  {activeTab} Console
                </h3>
                <ul className="space-y-4">
                  {activeTab === "student" &&
                    [
                      "Track real-time study metrics and assignment calendars",
                      "Ask the AI Concept Tutor questions instantly",
                      "Earn daily streaks, XP, badges, and leaderboard ranks",
                      "Access course videos, notes, and quiz attempts",
                    ].map((text) => (
                      <li
                        key={text}
                        className="flex items-start gap-3 text-sm text-slate-300"
                      >
                        <CheckCircle
                          className="h-5 w-5 mt-0.5 shrink-0"
                          style={{ color: GOLD }}
                        />
                        {text}
                      </li>
                    ))}
                  {activeTab === "teacher" &&
                    [
                      "Create rich courses with videos, PDFs, and structured modules",
                      "Manage student progress, quizzes, and daily attendance",
                      "Generate and issue student completion certificates",
                      "View revenue analytics and quiz performance reports",
                    ].map((text) => (
                      <li
                        key={text}
                        className="flex items-start gap-3 text-sm text-slate-300"
                      >
                        <CheckCircle
                          className="h-5 w-5 mt-0.5 shrink-0"
                          style={{ color: "#818CF8" }}
                        />
                        {text}
                      </li>
                    ))}
                  {activeTab === "admin" &&
                    [
                      "Monitor platform-wide revenue and billing metrics",
                      "Toggle maintenance mode and commission settings",
                      "Manage all teachers, students, and course approvals",
                      "Execute secure database backups with one click",
                    ].map((text) => (
                      <li
                        key={text}
                        className="flex items-start gap-3 text-sm text-slate-300"
                      >
                        <CheckCircle
                          className="h-5 w-5 mt-0.5 shrink-0"
                          style={{ color: "#34D399" }}
                        />
                        {text}
                      </li>
                    ))}
                </ul>
                <button
                  onClick={openRegister}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm group transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                    color: "#0F172A",
                    boxShadow: "0 4px 15px rgba(201,162,39,0.3)",
                  }}
                >
                  Explore{" "}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                  Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              <div className="flex-1 w-full">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(201,162,39,0.1)" }}
                >
                  <img
                    src={
                      activeTab === "student"
                        ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
                        : activeTab === "teacher"
                          ? "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=700&q=80"
                          : "https://images.unsplash.com/photo-1551434678-e076c223a692?w=700&q=80"
                    }
                    alt={`${activeTab} preview`}
                    className="w-full object-cover"
                    style={{ filter: "brightness(0.75) contrast(1.1)" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. COURSES
      ══════════════════════════════════════ */}
      <section id="courses" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(201,162,39,0.1)",
                border: "1px solid rgba(201,162,39,0.2)",
                color: GOLD,
              }}
            >
              Course Showcase
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Explore Popular Curriculum Paths
            </h2>
            <p className="text-slate-400">
              Accelerate your career with our top-rated academic programs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-300 group cursor-default"
                style={{
                  background: "rgba(30,41,59,0.8)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(201,162,39,0.25)";
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px rgba(0,0,0,0.4), 0 0 25px rgba(201,162,39,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.img}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: "brightness(0.75)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(15,23,42,0.8), transparent)",
                    }}
                  />
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    style={{
                      background: `${course.tagColor}20`,
                      border: `1px solid ${course.tagColor}40`,
                      color: course.tagColor,
                    }}
                  >
                    {course.tag}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className="h-3.5 w-3.5 fill-current"
                            style={{ color: GOLD_LIGHT }}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-400 ml-1">
                          {course.rating} · {course.students}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                      {course.desc}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <span
                      className="text-2xl font-black"
                      style={{ color: GOLD }}
                    >
                      {course.price}
                    </span>
                    <button
                      onClick={openRegister}
                      className="px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                        color: "#0F172A",
                        boxShadow: "0 4px 10px rgba(201,162,39,0.3)",
                      }}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. TESTIMONIALS
      ══════════════════════════════════════ */}
      <section
        id="testimonials"
        className="relative z-10 py-24 px-6"
        style={{ background: "rgba(30,41,59,0.2)" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(244,114,182,0.1)",
                border: "1px solid rgba(244,114,182,0.2)",
                color: "#F472B6",
              }}
            >
              User Reviews
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              What Our Community Says
            </h2>
            <p className="text-slate-400">
              Real experiences from students, teachers, and administrators
              worldwide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-7 rounded-3xl flex flex-col gap-5 transition-all duration-300"
                style={{
                  background: "rgba(30,41,59,0.7)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-current"
                      style={{ color: GOLD_LIGHT }}
                    />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed text-sm italic">
                  "{t.quote}"
                </p>
                <div
                  className="flex items-center gap-3 pt-2 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-slate-950 shrink-0"
                    style={{ background: t.gradient }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. PRICING
      ══════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(201,162,39,0.1)",
                border: "1px solid rgba(201,162,39,0.2)",
                color: GOLD,
              }}
            >
              Pricing Plans
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Transparent, Flexible Pricing
            </h2>
            <p className="text-slate-400">
              Choose a plan that fits your learning goals. Upgrade anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricing.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: plan.highlight ? -8 : -4 }}
                  className="relative p-8 rounded-3xl flex flex-col gap-6 transition-all duration-300"
                  style={{
                    background: plan.highlight
                      ? "linear-gradient(135deg, rgba(201,162,39,0.12), rgba(245,158,11,0.06))"
                      : "rgba(30,41,59,0.7)",
                    border: plan.highlight
                      ? "1px solid rgba(201,162,39,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: plan.highlight
                      ? "0 0 40px rgba(201,162,39,0.15), 0 25px 50px rgba(0,0,0,0.3)"
                      : "none",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {plan.badge && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                      style={{
                        background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                        color: "#0F172A",
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background: plan.highlight
                          ? "rgba(201,162,39,0.2)"
                          : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: plan.highlight ? GOLD : "#94A3B8" }}
                      />
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {plan.name}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{plan.desc}</p>
                  </div>

                  <div className="flex items-end gap-1">
                    <span
                      className="text-5xl font-black"
                      style={{ color: plan.highlight ? GOLD : "#fff" }}
                    >
                      {plan.price}
                    </span>
                    {plan.sub !== "forever" && (
                      <span className="text-slate-500 text-sm pb-2">
                        /{plan.sub}
                      </span>
                    )}
                    {plan.sub === "forever" && (
                      <span className="text-slate-500 text-sm pb-2">
                        {plan.sub}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2.5 text-sm text-slate-300"
                      >
                        <CheckCircle
                          className="h-4 w-4 shrink-0"
                          style={{ color: plan.highlight ? GOLD : "#34D399" }}
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={openRegister}
                    className="w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105"
                    style={
                      plan.highlight
                        ? {
                            background:
                              "linear-gradient(135deg, #C9A227, #F59E0B)",
                            color: "#0F172A",
                            boxShadow: "0 4px 20px rgba(201,162,39,0.4)",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                          }
                    }
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9. FAQ
      ══════════════════════════════════════ */}
      <section
        id="faq"
        className="relative z-10 py-24 px-6"
        style={{ background: "rgba(30,41,59,0.15)" }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.2)",
                color: "#34D399",
              }}
            >
              FAQ
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400">
              Everything you need to know about LMS PRO.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(30,41,59,0.7)",
                  border:
                    openFaq === i
                      ? "1px solid rgba(201,162,39,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-white text-sm pr-4">
                    {faq.q}
                  </span>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      background:
                        openFaq === i
                          ? "rgba(201,162,39,0.15)"
                          : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4" style={{ color: GOLD }} />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm text-slate-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          10. CTA BANNER
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(15,23,42,0.8) 50%, rgba(245,158,11,0.1) 100%)",
              border: "1px solid rgba(201,162,39,0.3)",
              boxShadow: "0 0 60px rgba(201,162,39,0.1)",
            }}
          >
            {/* Glow orbs inside banner */}
            <div
              className="absolute -left-8 -top-8 w-48 h-48 rounded-full opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`,
                filter: "blur(30px)",
              }}
            />
            <div
              className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full opacity-15 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${GOLD_LIGHT} 0%, transparent 70%)`,
                filter: "blur(30px)",
              }}
            />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "rgba(201,162,39,0.15)",
                  border: "1px solid rgba(201,162,39,0.3)",
                  color: GOLD,
                }}
              >
                <Crown className="h-3.5 w-3.5" />
                Join 12,000+ Learners
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white">
                Elevate Your Academics <br />
                <span style={{ color: GOLD }}>Starting Today</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Join thousands of students and teachers already collaborating.
                Registration takes less than 60 seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={openRegister}
                  className="px-8 py-4 rounded-full font-black text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                    color: "#0F172A",
                    boxShadow: "0 4px 25px rgba(201,162,39,0.5)",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  Join Platform Now
                </button>
                <button
                  onClick={openLogin}
                  className="px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          11. FOOTER
      ══════════════════════════════════════ */}
      <footer
        className="relative z-10 py-16 px-6 border-t"
        style={{
          borderColor: "rgba(201,162,39,0.1)",
          background: "rgba(15,23,42,0.95)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                  }}
                >
                  <GraduationCap className="h-4.5 w-4.5 text-slate-950" />
                </div>
                <span className="text-lg font-black" style={{ color: GOLD }}>
                  LMS PRO
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Enterprise learning suite designed for modern classrooms with
                AI-powered education support, gamification, and live class
                integrations.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                  <button
                    key={s}
                    className="text-xs font-bold text-slate-500 hover:text-gold transition-colors px-3 py-1.5 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                Platform
              </h4>
              <div className="flex flex-col gap-2.5 text-sm">
                {[
                  { label: "Features", id: "features" },
                  { label: "Dashboards", id: "preview" },
                  { label: "Curriculums", id: "courses" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="text-left text-slate-500 hover:text-gold transition-colors font-medium"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Security */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                Security
              </h4>
              <div className="flex flex-col gap-2.5 text-sm">
                {[
                  "OTP Verification",
                  "JWT Authentication",
                  "Role-Based Guards",
                  "SSL Encryption",
                ].map((s) => (
                  <span key={s} className="text-slate-500 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                Contact
              </h4>
              <div className="flex flex-col gap-2.5 text-sm">
                <span className="text-slate-500">support@lmspro.edu</span>
                <span className="text-slate-500">+1 (800) LMS-PRO</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#34D399" }}
                  />
                  <span className="text-xs font-semibold text-emerald-400">
                    All Systems Operational
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
            style={{ borderColor: "rgba(201,162,39,0.08)" }}
          >
            <p className="text-xs text-slate-600">
              © 2026 LMS PRO Systems Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <button
                    key={item}
                    className="text-xs text-slate-600 hover:text-gold transition-colors"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
