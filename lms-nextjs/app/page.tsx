"use client";

// app/page.tsx — Master E-Learning Public Landing Page with All 15 Sections
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";
import ThreeHeroScene from "@/components/landing/ThreeHeroScene";
import InteractivePresentation from "@/components/landing/InteractivePresentation";
import ModernCourseShowcase from "@/components/landing/ModernCourseShowcase";
import toast from "react-hot-toast";

export default function MasterLandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<"student" | "teacher" | "admin">("student");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success("Subscribed to LMS Pro Newsletter!");
    setNewsletterEmail("");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmittingContact(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(data.message || "Your message has been submitted successfully.");
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Unable to submit your request.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const FAQS = [
    {
      q: "What is LMS Pro and how does it work?",
      a: "LMS Pro is an enterprise-grade Learning Management System powered by Next.js 15, PostgreSQL, and Three.js 3D. It provides role-based portals for Students, Teachers, and Super Admins.",
    },
    {
      q: "Is LMS Pro free to get started for students?",
      a: "Yes! Students can sign up for free, browse open courses, take auto-graded quizzes, and receive shareable verified certificates upon course completion.",
    },
    {
      q: "How does the real-time AI Tutor work?",
      a: "The AI Tutor streams answers word-by-word while you watch course lessons, helping you debug code, explain complex concepts, and answer questions 24/7.",
    },
    {
      q: "Can instructors build quizzes and track student progress?",
      a: "Absolutely. Teachers have dedicated dashboards to create course modules, build auto-graded quizzes, mark attendance, and track student completion metrics.",
    },
    {
      q: "Are completion certificates publicly verifiable?",
      a: "Yes. Every issued certificate comes with a unique public URL (/verify-certificate/ID) that employers and institutions can instantly verify.",
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans transition-colors relative z-10">
      {/* ── 1. Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-base-100/85 backdrop-blur-md border-b border-base-300 px-4 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-content font-bold text-lg flex items-center justify-center shadow-sm shadow-primary/30">
            🎓
          </div>
          <span className="font-bold text-lg text-base-content tracking-tight font-display">
            LMS Pro
          </span>
        </div>

        {/* Header Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-base-content/70">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#courses" className="hover:text-primary transition-colors">Courses</a>
          <a href="#workflow" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#roles" className="hover:text-primary transition-colors">Role Overview</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-base-200 hover:bg-base-300 flex items-center justify-center text-sm transition-all text-base-content"
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {isAuthenticated && user ? (
            <Link href={`/${user.role === "super_admin" ? "admin" : user.role}/dashboard`}>
              <Button variant="primary">Go to Dashboard →</Button>
            </Link>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setAuthModal("login")}>
                Sign In
              </Button>
              <Button variant="primary" onClick={() => setAuthModal("register")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ── 2. Hero Section (Left Text + Right Three.js 3D Canvas) */}
      <section className="relative px-6 py-12 lg:py-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider animate-fade-in">
              <span>⚡ Next.js 15 + PostgreSQL + Three.js 3D</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-base-content tracking-tight font-display leading-tight">
              Enterprise Learning Powered by <span className="text-primary">AI & WebSockets</span> 🎓
            </h1>

            <p className="text-base sm:text-lg text-base-content/70 max-w-xl leading-relaxed">
              An all-in-one Learning Management System featuring interactive video lessons, real-time messaging, AI tutoring, auto-graded quizzes, and verified credentials.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isAuthenticated && user ? (
                <Link href={`/${user.role === "super_admin" ? "admin" : user.role}/dashboard`}>
                  <Button variant="primary" size="lg">Enter Portal →</Button>
                </Link>
              ) : (
                <>
                  <Button variant="primary" size="lg" onClick={() => setAuthModal("register")}>
                    Start Learning Free
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setAuthModal("login")}>
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <Card className="w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20 p-2 overflow-hidden shadow-2xl backdrop-blur-xl">
              <ThreeHeroScene />
            </Card>
          </div>
        </div>
      </section>

      {/* ── 3. Platform Statistics */}
      <section className="px-6 py-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Students", value: "10,000+", icon: "👥" },
            { label: "Expert Courses", value: "500+", icon: "📚" },
            { label: "Completion Rate", value: "94.8%", icon: "⚡" },
            { label: "Verified Certificates", value: "15,200+", icon: "📜" },
          ].map((stat) => (
            <Card key={stat.label} className="py-5 text-center hover:border-primary/50 transition-all">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary font-display">{stat.value}</div>
              <p className="text-xs text-base-content/60 font-medium mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 4. Interactive Java DSA Presentation Deck */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full">
        <InteractivePresentation />
      </section>

      {/* ── 5. Features & Key Benefits */}
      <section id="features" className="bg-base-100/90 py-20 px-6 border-t border-b border-base-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="primary">Core Capabilities</Badge>
            <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
              Built for Modern E-Learning Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🤖", title: "Real-time AI Tutor", desc: "Streaming answers word-by-word during lessons to resolve questions instantly." },
              { icon: "💬", title: "Socket.io Live Chat", desc: "Bi-directional WebSocket messaging and live presence indicators across channels." },
              { icon: "🧠", title: "Auto-Graded Quizzes", desc: "Multiple question types, instant accuracy scoring, and XP gamification rewards." },
              { icon: "📜", title: "Public Certificates", desc: "Shareable verified certificates with unique URL validation." },
              { icon: "📊", title: "Role-Aware Portals", desc: "Tailored dashboards for Students, Teachers, and Super Administrators." },
              { icon: "⚡", title: "PostgreSQL & Swagger", desc: "OpenAPI 3.0 documented REST endpoints with sub-50ms query response times." },
            ].map((f) => (
              <Card key={f.title} className="hover:border-primary/60 transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-base text-base-content font-display mb-1">{f.title}</h3>
                <p className="text-xs text-base-content/60 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. How It Works (Step-by-Step Workflow) */}
      <section id="workflow" className="px-6 py-20 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="secondary">Step-by-Step</Badge>
          <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
            How LMS Pro Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Create Free Account", desc: "Sign up in seconds as a Student, Teacher, or Admin." },
            { step: "02", title: "Enroll in Courses", desc: "Browse fullstack programming, data science, and design catalogs." },
            { step: "03", title: "Learn & Chat with AI", desc: "Watch video lessons and ask questions to the real-time AI tutor." },
            { step: "04", title: "Earn Certificate", desc: "Complete auto-graded quizzes and claim your shareable verified credential." },
          ].map((s) => (
            <Card key={s.step} className="relative p-6 space-y-3 border-t-4 border-t-primary">
              <span className="text-3xl font-extrabold text-primary/40 font-display">{s.step}</span>
              <h3 className="font-bold text-base text-base-content font-display">{s.title}</h3>
              <p className="text-xs text-base-content/60 leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 7. Featured Courses Showcase */}
      <section id="courses" className="bg-base-100/90 py-20 px-6 border-t border-b border-base-300">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="accent">Featured Catalog</Badge>
            <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
              Popular Courses with 3D WebGL Cards
            </h2>
          </div>

          <ModernCourseShowcase onSelectCourse={() => setAuthModal("register")} />
        </div>
      </section>

      {/* ── 8. Role Overview (Student, Teacher, Admin) */}
      <section id="roles" className="px-6 py-20 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3">
          <Badge variant="primary">Role-Based Ecosystem</Badge>
          <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
            Tailored Experiences for Every Role
          </h2>
        </div>

        {/* Role Tabs Selector */}
        <div className="flex justify-center gap-3">
          {(["student", "teacher", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRoleTab(r)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeRoleTab === r
                  ? "bg-primary text-primary-content shadow-md shadow-primary/30"
                  : "bg-base-100 hover:bg-base-200 text-base-content border border-base-300"
              }`}
            >
              {r === "admin" ? "Super Admin" : r} Portal
            </button>
          ))}
        </div>

        {/* Role Content Card */}
        <Card className="p-8 max-w-4xl mx-auto border-2 border-primary/20 space-y-4">
          {activeRoleTab === "student" && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xl font-bold text-primary font-display">🎓 Student Portal</h3>
              <p className="text-sm text-base-content/70">
                Students access course modules, watch video lessons, ask questions to the AI tutor, complete auto-graded quizzes, track streak XP rewards, and download verified certificates.
              </p>
            </div>
          )}
          {activeRoleTab === "teacher" && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xl font-bold text-secondary font-display">👨‍🏫 Teacher Portal</h3>
              <p className="text-sm text-base-content/70">
                Instructors publish course modules, upload video lectures, build quizzes with solution keys, mark student attendance rosters, and send real-time announcement messages.
              </p>
            </div>
          )}
          {activeRoleTab === "admin" && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xl font-bold text-error font-display">⚡ Super Admin Portal</h3>
              <p className="text-sm text-base-content/70">
                Administrators manage system user accounts, update role permissions, inspect server health metrics, monitor database connections, and configure global platform settings.
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* ── 9. Testimonials & Success Stories */}
      <section className="bg-base-100/90 py-20 px-6 border-t border-b border-base-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="success">Student Reviews</Badge>
            <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
              Trusted by 10,000+ Learners Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Jessica Lin", role: "Frontend Engineer", text: "The Next.js 15 course and AI tutor helped me land a senior frontend role in 6 weeks!" },
              { name: "Rahul Sharma", role: "Computer Science Student", text: "The Java DSA visualizers and auto-graded quizzes made learning algorithms so intuitive." },
              { name: "Elena Rostova", role: "Fullstack Developer", text: "The public verified certificates are amazing for showcasing credentials on LinkedIn." },
            ].map((t) => (
              <Card key={t.name} className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500 text-xs">⭐⭐⭐⭐⭐</div>
                <p className="text-xs text-base-content/70 italic leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="pt-2 border-t border-base-200">
                  <p className="text-xs font-bold text-base-content">{t.name}</p>
                  <p className="text-[11px] text-base-content/50">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Technology Stack */}
      <section className="px-6 py-20 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3">
          <Badge variant="info">Tech Architecture</Badge>
          <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
            Powered by Modern Tech Stack
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { name: "Next.js 15", desc: "React App Router" },
            { name: "PostgreSQL", desc: "Prisma ORM" },
            { name: "Three.js", desc: "3D WebGL Engine" },
            { name: "FlyonUI", desc: "Tailwind CSS System" },
            { name: "Socket.io", desc: "Real-time WebSockets" },
            { name: "TypeScript", desc: "End-to-End Type Safety" },
            { name: "Swagger 3.0", desc: "OpenAPI Specs" },
            { name: "Recharts", desc: "Analytics Charts" },
          ].map((tech) => (
            <Card key={tech.name} className="p-4 text-center">
              <div className="font-bold text-sm text-primary font-display">{tech.name}</div>
              <p className="text-[11px] text-base-content/60 mt-0.5">{tech.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 11. FAQ Section */}
      <section id="faq" className="bg-base-100/90 py-20 px-6 border-t border-b border-base-300">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="warning">Got Questions?</Badge>
            <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Card key={i} className="cursor-pointer" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <div className="flex items-center justify-between font-bold text-sm text-base-content">
                  <span>{faq.q}</span>
                  <span className="text-primary">{faqOpen === i ? "−" : "+"}</span>
                </div>
                {faqOpen === i && (
                  <p className="text-xs text-base-content/70 mt-3 pt-3 border-t border-base-200 leading-relaxed animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Contact Section */}
      <section id="contact" className="px-6 py-20 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="primary">Get in Touch</Badge>
          <h2 className="text-3xl font-extrabold text-base-content font-display tracking-tight">
            Contact LMS Pro Support
          </h2>
        </div>

        <Card className="p-8 space-y-4">
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="Jane Doe"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="jane@lmspro.edu"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
              <Input
                label="Subject *"
                placeholder="Course Inquiry / Technical Support"
                required
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
                Message *
              </label>
              <textarea
                rows={4}
                required
                placeholder="How can we help you?"
                className="w-full p-3.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
            </div>

            <Button type="submit" variant="primary" isLoading={isSubmittingContact} className="w-full">
              Submit Support Request
            </Button>
          </form>
        </Card>
      </section>

      {/* ── 13. Newsletter Subscription */}
      <section className="bg-primary text-primary-content py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold font-display">Subscribe to LMS Pro Weekly Updates</h2>
          <p className="text-sm opacity-90 max-w-xl mx-auto">
            Get the latest courses, Java DSA tutorials, and AI learning tips delivered directly to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ── 14 & 15. Footer with Links & Policies */}
      <footer className="bg-base-100 border-t border-base-300 py-12 px-6 text-xs text-base-content/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-content font-bold flex items-center justify-center">🎓</div>
              <span className="font-bold text-base text-base-content font-display">LMS Pro</span>
            </div>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Enterprise-grade Learning Management System with AI tutoring, real-time messaging, and verified credentials.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-base-content uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-primary">Features</a></li>
              <li><a href="#courses" className="hover:text-primary">Courses</a></li>
              <li><a href="#workflow" className="hover:text-primary">How It Works</a></li>
              <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base-content uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setAuthModal("login")} className="hover:text-primary">Student Portal</button></li>
              <li><button onClick={() => setAuthModal("login")} className="hover:text-primary">Teacher Portal</button></li>
              <li><button onClick={() => setAuthModal("login")} className="hover:text-primary">Super Admin Portal</button></li>
              <li><Link href="/api-docs" className="hover:text-primary">Swagger API Specs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base-content uppercase tracking-wider mb-3">Legal & Support</h4>
            <ul className="space-y-2">
              <li><a href="#privacy" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#contact" className="hover:text-primary">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LMS Pro Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Twitter</a>
            <a href="#" className="hover:text-primary">GitHub</a>
            <a href="#" className="hover:text-primary">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* ── Login Modal */}
      <Modal isOpen={authModal === "login"} onClose={() => setAuthModal(null)} title="Sign In to LMS Pro">
        <LoginPage />
      </Modal>

      {/* ── Register Modal */}
      <Modal isOpen={authModal === "register"} onClose={() => setAuthModal(null)} title="Create Student Account">
        <RegisterPage />
      </Modal>
    </div>
  );
}
