import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Palette, Mail, Server, Image, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { getSettings, updateSettings } from "../../../services/adminModulesService";
import GeneralSettings from "./GeneralSettings";
import ThemeSettings from "./ThemeSettings";
import EmailSettings from "./EmailSettings";
import SystemSettings from "./SystemSettings";
import BrandingSettings from "./BrandingSettings";

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

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res && res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Error loading branding settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (data) => {
    const res = await updateSettings(data);
    if (res && res.success) {
      setSettings(res.data);
    } else {
      throw new Error(res?.message || "Failed to save settings");
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "theme":
        return <ThemeSettings />;
      case "email":
        return <EmailSettings />;
      case "system":
        return <SystemSettings settings={settings} onSave={handleSaveSettings} />;
      case "branding":
        return <BrandingSettings settings={settings} onSave={handleSaveSettings} />;
      default:
        return <GeneralSettings settings={settings} onSave={handleSaveSettings} />;
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      id="admin-settings-container"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Branding & System Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure branding assets, platforms taglines, commission rates, and email SMTP servers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-medium"
            disabled={loading}
            onClick={fetchSettings}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Settings
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="general" className="gap-2 text-xs font-semibold">
              <Building className="h-4 w-4" /> General Settings
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2 text-xs font-semibold">
              <Palette className="h-4 w-4" /> UI Themes
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2 text-xs font-semibold">
              <Mail className="h-4 w-4" /> SMTP Settings
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2 text-xs font-semibold">
              <Server className="h-4 w-4" /> System Rules
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2 text-xs font-semibold">
              <Image className="h-4 w-4" /> Logo & Taglines
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Tab Area */}
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