"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api-config";
import TopicContentHeader from "@/components/teacher/TopicContentHeader";
import FullPageQuizBuilder from "@/components/teacher/FullPageQuizBuilder";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";

export default function TopicQuizPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    docs: 0,
    quiz: 0,
    assignments: 0,
    videos: 0,
    resources: 0,
  });

  const courseId = topic?.course?.id || topic?.module?.courseId;
  const courseTitle = topic?.course?.title || "Course";
  const topicTitle = topic?.title || "Topic";

  useBreadcrumbs(
    topic
      ? [
          { label: "Courses", href: "/teacher/courses" },
          { label: courseTitle, href: courseId ? `/teacher/courses/${courseId}/edit` : "/teacher/courses" },
          { label: "Topics", href: courseId ? `/teacher/courses/${courseId}/edit` : undefined },
          { label: topicTitle, href: `/topics/${topicId}/docs` },
          { label: "Quiz" },
        ]
      : undefined
  );

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }

    const fetchTopicData = async () => {
      try {
        const res = await fetch(`${API_URL}/topics/${topicId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.topic) {
          const t = data.data.topic;
          setTopic(t);

          const resList = t.resources || [];
          const videoCount = (t.videoUrl ? 1 : 0) + resList.filter((r: any) => r.resourceType === "video").length;
          const otherResources = resList.filter((r: any) => r.resourceType !== "video" && r.resourceType !== "doc");

          setStats({
            docs: t.docs?.length || 0,
            quiz: t.quizzes?.length || 0,
            assignments: t.assignments?.length || 0,
            videos: videoCount,
            resources: otherResources.length,
          });
        } else {
          router.replace("/teacher/courses");
        }
      } catch (err) {
        console.error("Failed to load topic details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [topicId, token, user, authLoading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-base-100">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (!topic) return null;

  return (
    <div className="flex flex-col min-h-full w-full bg-base-100">
      <TopicContentHeader
        topic={topic}
        activeTab="quiz"
        stats={stats}
      />

      <FullPageQuizBuilder
        topicId={topicId}
        moduleId={topic.moduleId}
        courseId={topic.module?.courseId || topic.course?.id}
        onStatsUpdated={(count) => setStats((prev) => ({ ...prev, quiz: count }))}
      />
    </div>
  );
}
