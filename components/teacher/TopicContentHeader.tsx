"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  HelpCircle,
  ClipboardList,
  Video,
  Paperclip,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export type TopicTab = "docs" | "quiz" | "assignments" | "videos" | "resources";

interface TopicContentHeaderProps {
  topic: any;
  activeTab: TopicTab;
  stats?: {
    docs?: number;
    quiz?: number;
    assignments?: number;
    videos?: number;
    resources?: number;
  };
  extraActions?: React.ReactNode;
}

export default function TopicContentHeader({
  topic,
  activeTab,
  stats,
  extraActions,
}: TopicContentHeaderProps) {
  const router = useRouter();

  const courseId = topic?.course?.id || topic?.module?.courseId;
  const backUrl = courseId ? `/teacher/courses/${courseId}/edit` : "/teacher/courses";

  const tabs: Array<{
    id: TopicTab;
    label: string;
    icon: any;
    count?: number;
    color: string;
    activeClass: string;
  }> = [
    {
      id: "docs",
      label: "Docs",
      icon: FileText,
      count: stats?.docs,
      color: "text-info",
      activeClass: "border-info text-info bg-info/5",
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: HelpCircle,
      count: stats?.quiz,
      color: "text-warning",
      activeClass: "border-warning text-warning bg-warning/5",
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: ClipboardList,
      count: stats?.assignments,
      color: "text-secondary",
      activeClass: "border-secondary text-secondary bg-secondary/5",
    },
    {
      id: "videos",
      label: "Videos",
      icon: Video,
      count: stats?.videos,
      color: "text-primary",
      activeClass: "border-primary text-primary bg-primary/5",
    },
    {
      id: "resources",
      label: "Resources",
      icon: Paperclip,
      count: stats?.resources,
      color: "text-emerald-500",
      activeClass: "border-emerald-500 text-emerald-500 bg-emerald-500/5",
    },
  ];

  return (
    <div className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300">
      {/* ── TOP BAR */}
      <div className="px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-base-200/60">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backUrl}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content transition-all shadow-2xs"
            title="Back to Course Classes & Topics"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="min-w-0">
            {/* Breadcrumb row */}
            <div className="flex items-center gap-1.5 text-xs text-base-content/50 truncate">
              {topic?.course?.title && (
                <>
                  <span className="truncate hover:text-base-content transition-colors">
                    {topic.course.title}
                  </span>
                  <ChevronRight size={12} className="shrink-0" />
                </>
              )}
              {topic?.module?.title && (
                <>
                  <span className="truncate hover:text-base-content transition-colors">
                    {topic.module.title}
                  </span>
                  <ChevronRight size={12} className="shrink-0" />
                </>
              )}
              <span className="font-semibold text-primary truncate">
                Topic #{topic?.order || 1}
              </span>
            </div>

            {/* Topic Title */}
            <h1 className="text-base sm:text-lg font-bold text-base-content truncate">
              {topic?.title || "Loading topic..."}
            </h1>
          </div>
        </div>

        {/* Action buttons (Autosave, Draft, Preview, Publish, etc.) */}
        {extraActions && (
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {extraActions}
          </div>
        )}
      </div>

      {/* ── UNIFIED TABS */}
      <div className="px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5 bg-base-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const targetUrl = `/topics/${topic?.id}/${tab.id}`;

          return (
            <Link
              key={tab.id}
              href={targetUrl}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                isActive
                  ? `${tab.activeClass} font-bold shadow-xs`
                  : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/60"
              }`}
            >
              <Icon size={15} className={isActive ? tab.color : "text-base-content/50"} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-base-100 border border-current shadow-2xs" : "bg-base-200 text-base-content/70"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
