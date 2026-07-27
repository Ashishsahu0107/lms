import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import ReportsDashboard from "./ReportsDashboard";
import StudentReports from "./StudentReports";
import TeacherReports from "./TeacherReports";
import RevenueReports from "./RevenueReports";
import CourseReports from "./CourseReports";

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

export default function AdminReports() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderActiveView = () => {
    switch (currentView) {
      case "students":
        return <StudentReports onBack={() => setCurrentView("dashboard")} />;
      case "teachers":
        return <TeacherReports onBack={() => setCurrentView("dashboard")} />;
      case "revenue":
        return <RevenueReports onBack={() => setCurrentView("dashboard")} />;
      case "courses":
        return <CourseReports onBack={() => setCurrentView("dashboard")} />;
      default:
        return (
          <ReportsDashboard onNavigateToView={(view) => setCurrentView(view)} />
        );
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      id="admin-reports-container"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            System Telemetry Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, preview, and download custom system-wide audit sheets.
          </p>
        </div>
        {currentView === "dashboard" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-medium"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" /> Refresh Telemetries
            </Button>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
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
