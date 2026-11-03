"use client";

// components/landing/ModernCourseShowcase.tsx — Filterable course showcase with responsive image cards
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CourseItem {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
  students: number;
  instructor: string;
  description: string;
  image: string;
  badgeVariant: "primary" | "secondary" | "accent" | "info";
}

const COURSES: CourseItem[] = [
  {
    id: "c-1",
    title: "Fullstack Next.js 15 & MongoDB",
    category: "Programming",
    difficulty: "beginner",
    rating: 4.9,
    students: 1420,
    instructor: "Prof. Ashish Sahu",
    description:
      "Master modern web development with Next.js App Router, Mongoose, and MongoDB Atlas.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    badgeVariant: "primary",
  },
  {
    id: "c-2",
    title: "Real-time WebSockets with Socket.io",
    category: "Programming",
    difficulty: "intermediate",
    rating: 4.8,
    students: 980,
    instructor: "Dr. Sarah Jenkins",
    description:
      "Build bi-directional chat applications, streaming feeds, and live presence systems.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    badgeVariant: "secondary",
  },
  {
    id: "c-3",
    title: "AI Prompt Engineering & LLM Apps",
    category: "Data Science",
    difficulty: "intermediate",
    rating: 4.95,
    students: 2310,
    instructor: "Alex Rivera",
    description:
      "Integrate LLM streaming models, vector stores, and AI tutors into web applications.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
    badgeVariant: "accent",
  },
  {
    id: "c-4",
    title: "Minimalist UI/UX Design System with Tailwind",
    category: "Design",
    difficulty: "beginner",
    rating: 4.85,
    students: 1150,
    instructor: "Emma Watson",
    description:
      "Design clean, high-end responsive user interfaces using FlyonUI semantic color tokens.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    badgeVariant: "info",
  },
  {
    id: "c-5",
    title: "MongoDB Database Architecture & Optimization",
    category: "Data Science",
    difficulty: "advanced",
    rating: 4.9,
    students: 840,
    instructor: "Marcus Vance",
    description:
      "Document modeling, indexing strategies, query optimization, and connection pooling with Mongoose.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    badgeVariant: "primary",
  },
  {
    id: "c-6",
    title: "Product Management for Tech Startups",
    category: "Business",
    difficulty: "beginner",
    rating: 4.75,
    students: 620,
    instructor: "David Miller",
    description:
      "Learn agile development, user story mapping, metrics analytics, and product launches.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    badgeVariant: "secondary",
  },
];

export default function ModernCourseShowcase({
  onSelectCourse,
}: {
  onSelectCourse?: (courseId: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Programming",
    "Data Science",
    "Design",
    "Business",
  ];

  const filteredCourses =
    selectedCategory === "All"
      ? COURSES
      : COURSES.filter((c) => c.category === selectedCategory);

  return (
    <section className="space-y-8">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-primary text-primary-content shadow-sm shadow-primary/30"
                : "bg-base-100 hover:bg-base-200 text-base-content border border-base-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((c) => (
          <Card
            key={c.id}
            className="hover:border-primary/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
          >
            <div>
              <div className="relative w-full h-44 sm:h-48 rounded-xl mb-4 overflow-hidden border border-base-300 shadow-inner">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-base-100/10 to-transparent" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-base-100/80 backdrop-blur text-primary text-[9px] font-extrabold tracking-wider uppercase border border-base-300">
                  Featured
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <Badge variant={c.badgeVariant}>{c.category}</Badge>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <span>⭐</span>
                  <span>{c.rating}</span>
                </div>
              </div>

              <h3 className="font-bold text-base text-base-content group-hover:text-primary transition-colors font-display line-clamp-1">
                {c.title}
              </h3>
              <p className="text-xs text-base-content/60 line-clamp-2 mt-1 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-base-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-base-content/70">
                  {c.students} enrolled
                </span>
                <p className="text-[11px] text-base-content/50">
                  By {c.instructor}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelectCourse?.(c.id)}
              >
                Enroll Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
