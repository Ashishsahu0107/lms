import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Megaphone, Clock, Send, ShieldAlert, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { getNotifications, sendNotification } from "../../../services/adminModulesService";
import NotificationCenter from "./NotificationCenter";
import CreateNotification from "./CreateNotification";
import NotificationHistory from "./NotificationHistory";

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

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [notifications, setNotifications] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res && res.success) {
        // Divide notifications
        const allNotifs = res.data || [];
        setNotifications(allNotifs);
        
        // System broadcasts are filtered where type is 'announcement' or targetRole is defined
        const broads = allNotifs.filter((n) => n.targetRole === "all" || n.targetRole === "teacher" || n.targetRole === "student" || n.type === "announcement");
        setBroadcasts(broads);
      }
    } catch (err) {
      console.error("Error loading system notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleSendBroadcast = async (formData) => {
    const payload = {
      title: formData.title,
      message: formData.message,
      targetRole: formData.target,
      type: formData.type,
    };
    const res = await sendNotification(payload);
    if (res && res.success) {
      // Refresh notifications lists
      await fetchNotifications();
    } else {
      throw new Error(res?.message || "Failed to dispatch broadcast");
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "broadcast":
        return <CreateNotification onSend={handleSendBroadcast} />;
      case "history":
        return <NotificationHistory broadcasts={broadcasts} />;
      default:
        return (
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
            onMarkAllRead={handleMarkAllRead}
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
      id="admin-notifications-container"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            System Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dispatch announcements, inspect platform-wide alert logs, and target learning roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-medium"
            disabled={loading}
            onClick={fetchNotifications}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Alerts
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="alerts" className="gap-2 text-xs font-semibold">
              <Bell className="h-4 w-4" /> Live Alerts ({notifications.filter(n => !n.read).length})
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="gap-2 text-xs font-semibold">
              <Megaphone className="h-4 w-4" /> Send Broadcast
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 text-xs font-semibold">
              <Clock className="h-4 w-4" /> Broadcast History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Main Tab Content */}
      <motion.div variants={item} className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}