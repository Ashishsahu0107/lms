import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import {
  getSecurityLogs,
  getSessions,
  getSettings,
  updateSettings,
} from "../../../services/adminModulesService";
import SecurityDashboard from "./SecurityDashboard";
import UserSessions from "./UserSessions";
import AccessLogs from "./AccessLogs";
import Permissions from "./Permissions";
import SecuritySettings from "./SecuritySettings";

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

export default function AdminSecurity() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [logsRes, sessionsRes, settingsRes] = await Promise.all([
        getSecurityLogs(),
        getSessions(),
        getSettings(),
      ]);

      if (logsRes && logsRes.success) setLogs(logsRes.data || []);
      if (sessionsRes && sessionsRes.success)
        setSessions(sessionsRes.data || []);
      if (settingsRes && settingsRes.success)
        setSettings(settingsRes.data || null);
    } catch (err) {
      console.error("Error loading security parameters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleRevokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s._id !== id));
  };

  const handleRevokeAll = () => {
    // Keep only the first device (own device)
    setSessions((prev) => prev.slice(0, 1));
  };

  const handleUpdateSettings = async (data) => {
    const res = await updateSettings(data);
    if (res && res.success) {
      setSettings(res.data);
    } else {
      throw new Error(res?.message || "Failed to update configurations");
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case "sessions":
        return (
          <UserSessions
            onBack={() => setCurrentView("dashboard")}
            sessions={sessions}
            onRevokeSession={handleRevokeSession}
            onRevokeAll={handleRevokeAll}
          />
        );
      case "audit":
        return (
          <AccessLogs onBack={() => setCurrentView("dashboard")} logs={logs} />
        );
      case "permissions":
        return <Permissions onBack={() => setCurrentView("dashboard")} />;
      case "settings":
        return (
          <SecuritySettings
            onBack={() => setCurrentView("dashboard")}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      default:
        return (
          <SecurityDashboard
            stats={{
              activeSessionsCount: sessions.length,
              failedAttemptsCount: logs.filter(
                (l) => l.action === "FAILED_LOGIN",
              ).length,
              blockedIpsCount: 2,
            }}
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
      id="admin-security-container"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-red-500 to-indigo-500 bg-clip-text text-transparent">
            Security Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and secure the LMS environment, configure IP blocks, and
            invalidate active sessions.
          </p>
        </div>
        {currentView === "dashboard" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-medium"
              disabled={loading}
              onClick={fetchSecurityData}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />{" "}
              Refresh Security
            </Button>
          </div>
        )}
      </motion.div>

      {/* Main Content Area */}
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
