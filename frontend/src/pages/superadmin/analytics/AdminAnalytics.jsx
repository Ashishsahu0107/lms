import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { getPlatformAnalytics } from "../../../services/adminModulesService";
import AnalyticsDashboard from "./AnalyticsDashboard";
import UserAnalytics from "./UserAnalytics";
import CourseAnalytics from "./CourseAnalytics";
import QuizAnalytics from "./QuizAnalytics";
import EngagementAnalytics from "./EngagementAnalytics";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function AdminAnalytics() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getPlatformAnalytics();
      if (res && res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error("Error loading analytics telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const renderActiveView = () => {
    switch (currentView) {
      case "users":
        return <UserAnalytics onBack={() => setCurrentView("dashboard")} data={analyticsData} />;
      case "courses":
        return <CourseAnalytics onBack={() => setCurrentView("dashboard")} data={analyticsData} />;
      case "quizzes":
        return <QuizAnalytics onBack={() => setCurrentView("dashboard")} data={analyticsData} />;
      case "engagement":
        return <EngagementAnalytics onBack={() => setCurrentView("dashboard")} data={analyticsData} />;
      default:
        return (
          <AnalyticsDashboard
            data={analyticsData}
            onNavigateToView={(view) => setCurrentView(view)}
          />
        );
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      id="admin-analytics-container"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Platform Analytics & Metrics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze learning patterns, signup curves, and student performance metrics.
          </p>
        </div>
        {currentView === "dashboard" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-medium"
              disabled={loading}
              onClick={fetchAnalytics}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Stats
            </Button>
          </div>
        )}
      </motion.div>

      {/* Main View Area */}
      <motion.div variants={item} className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}