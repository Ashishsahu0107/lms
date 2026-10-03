"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Mail,
  MessageCircle,
  HelpCircle,
  Send,
  CheckCircle2,
  FileQuestion,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function StudentSupport() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("course");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Support ticket submitted! We will respond within 24 hours.");
    }, 800);
  };

  const faqs = [
    {
      q: "How do I submit an assignment?",
      a: "Go to the Assignments tab in the sidebar, click on any active assignment, upload your file or write your text response, and click 'Submit Assignment'.",
    },
    {
      q: "How are quizzes graded?",
      a: "Multiple choice and true/false questions are auto-graded immediately after submission. Your score and accuracy breakdown will be displayed on the quiz results screen.",
    },
    {
      q: "When will I receive my course completion certificate?",
      a: "Certificates are automatically generated and unlocked once you complete 100% of all lectures, topics, and required assessments in an enrolled course.",
    },
    {
      q: "Can I contact my instructor directly?",
      a: "Yes! Navigate to the Messages tab to send direct messages to your assigned course teachers.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <LifeBuoy size={16} />
          <span>Help & Support Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content font-display tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-sm text-base-content/60 mt-1 max-w-2xl">
          Find answers to frequently asked questions, connect with our support
          team, or submit an assistance request.
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-base-100 border border-base-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-sm text-base-content mb-1">
              Course Inquiries
            </h3>
            <p className="text-xs text-base-content/60">
              Questions regarding course materials, topics, syllabus, or lecture videos.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-info mt-4">
            Response within 24h
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-base-100 border border-base-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center mb-3">
              <FileQuestion size={20} />
            </div>
            <h3 className="font-bold text-sm text-base-content mb-1">
              Quiz & Assignments
            </h3>
            <p className="text-xs text-base-content/60">
              Assistance with submission deadlines, re-evaluations, or scoring discrepancies.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-warning mt-4">
            Direct Teacher Contact
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-base-100 border border-base-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center mb-3">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-sm text-base-content mb-1">
              Technical Support
            </h3>
            <p className="text-xs text-base-content/60">
              Account access, login issues, video playback, or platform bugs.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-success mt-4">
            support@lmspro.edu
          </span>
        </div>
      </div>

      {/* Two Column Section: Form & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Ticket Form */}
        <div className="lg:col-span-7 bg-base-100 border border-base-200/80 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-base-content flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-primary" />
            <span>Submit a Support Request</span>
          </h2>

          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-base text-base-content">
                Ticket Received!
              </h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Thank you for reaching out. A confirmation has been sent to your email and our support team will update you shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setSubject("");
                  setMessage("");
                }}
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-200/40 text-xs text-base-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="course">Course Content & Lectures</option>
                  <option value="assignment">Assignment & Homework</option>
                  <option value="quiz">Quiz & Assessments</option>
                  <option value="technical">Platform & Technical Issue</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue opening Assignment 2 PDF file"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-200/40 text-xs text-base-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                  Message Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe what you need help with in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-200/40 text-xs text-base-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                className="w-full"
              >
                <Send size={14} /> Send Support Request
              </Button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-base-content flex items-center gap-2">
            <HelpCircle size={18} className="text-warning" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-base-100 border border-base-200/80 shadow-2xs space-y-1.5"
              >
                <h4 className="text-xs font-bold text-base-content">
                  {faq.q}
                </h4>
                <p className="text-[11px] text-base-content/60 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
