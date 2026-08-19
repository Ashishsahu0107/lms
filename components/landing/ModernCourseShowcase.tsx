"use client";

// components/landing/ModernCourseShowcase.tsx — Filterable Course Showcase with 3D Three.js WebGL Thumbnails
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ThreeCourseThumbnail from "@/components/landing/ThreeCourseThumbnail";

interface CourseItem {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
  students: number;
  instructor: string;
  description: string;
  threeType: "nextjs" | "socket" | "ai" | "design" | "database" | "business";
  gradient: string;
  badgeVariant: "primary" | "secondary" | "accent" | "info";
}

const COURSES: CourseItem[] = [
  {
    id: "c-1",
    title: "Fullstack Next.js 15 & PostgreSQL",
    category: "Programming",
    difficulty: "beginner",
    rating: 4.9,
    students: 1420,
    instructor: "Prof. Ashish Sahu",
    description:
      "Master modern web development with Next.js App Router, Prisma ORM, and PostgreSQL.",
    threeType: "nextjs",
    gradient: "from-indigo-500/10 via-purple-500/10 to-pink-500/10",
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
    threeType: "socket",
    gradient: "from-purple-500/10 via-indigo-500/10 to-violet-500/10",
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
    threeType: "ai",
    gradient: "from-pink-500/10 via-rose-500/10 to-purple-500/10",
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
    threeType: "design",
    gradient: "from-cyan-500/10 via-teal-500/10 to-emerald-500/10",
    badgeVariant: "info",
  },
  {
    id: "c-5",
    title: "PostgreSQL Database Architecture & Optimization",
    category: "Data Science",
    difficulty: "advanced",
    rating: 4.9,
    students: 840,
    instructor: "Marcus Vance",
    description:
      "Indexing strategies, query optimization, connection pooling, and Prisma ORM migrations.",
    threeType: "database",
    gradient: "from-emerald-500/10 via-teal-500/10 to-indigo-500/10",
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
    threeType: "business",
    gradient: "from-amber-500/10 via-orange-500/10 to-red-500/10",
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
              {/* ── Interactive 3D Three.js WebGL Thumbnail Container */}
              <div
                className={`relative w-full h-44 rounded-xl mb-4 bg-gradient-to-tr ${c.gradient} border border-base-300 overflow-hidden shadow-inner flex items-center justify-center`}
              >
                {/* 3D WebGL Model */}
                <ThreeCourseThumbnail type={c.threeType} />

                {/* Shimmer Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                {/* Difficulty Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-base-100/85 backdrop-blur text-[10px] font-bold text-base-content border border-base-300 shadow-xs">
                  {c.difficulty}
                </div>

                {/* 3D Badge Indicator */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-primary/80 backdrop-blur text-primary-content text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                  3D WebGL
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
