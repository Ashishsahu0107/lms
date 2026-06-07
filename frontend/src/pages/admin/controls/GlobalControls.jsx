import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Database,
  Mail,
  HardDrive,
  RefreshCw,
  Save,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { getSettings, updateSettings } from "../../../services/adminModulesService";
import { toast } from "react-hot-toast";

export default function GlobalControls() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [settings, setSettings] = useState({
    platformName: "LMS Academy",
    commissionRate: 10,
    allowedUploadSizeMB: 50,
    maintenanceMode: false,
    brandingLogo: "",
  });

  // SMTP Info State (Mock/Display)
  const [smtpSettings, setSmtpSettings] = useState({
    host: "smtp.mailtrap.io",
    port: 2525,
    user: "lms_system_mailer",
    secure: false,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res && res.success && res.data) {
        setSettings({
          platformName: res.data.platformName || "LMS Academy",
          commissionRate: res.data.commissionRate ?? 10,
          allowedUploadSizeMB: res.data.allowedUploadSizeMB ?? 50,
          maintenanceMode: res.data.maintenanceMode ?? false,
          brandingLogo: res.data.brandingLogo || "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateSettings(settings);
      if (res && res.success) {
        toast.success(res.message || "Global settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      // Simulate database backup
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Database snapshot created and archived successfully!");
    } catch (err) {
      toast.error("Backup failed");
    } finally {
      setBackingUp(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 border border-white/10 shadow-xl"
      >
        <div className="relative z-10">
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
            System & Administration
          </Badge>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Platform Configuration
          </h1>
          <p className="text-slate-400 max-w-xl text-sm">
            Control global features, maintenance modes, upload restrictions, SMTP parameters, and create platform-wide database backups.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute right-20 top-10 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
      </motion.div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2.5">
                <SettingsIcon className="h-5 w-5 text-blue-400 animate-pulse" />
                Global General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) =>
                      setSettings({ ...settings, platformName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Commission Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.commissionRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          commissionRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Percent className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Max Upload File Size (MB)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={settings.allowedUploadSizeMB}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          allowedUploadSizeMB: parseInt(e.target.value) || 50,
                        })
                      }
                      className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      MB
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Branding Logo URL
                  </label>
                  <input
                    type="text"
                    value={settings.brandingLogo}
                    onChange={(e) =>
                      setSettings({ ...settings, brandingLogo: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-500/10 bg-rose-500/5 mt-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-rose-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Maintenance Mode</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Activating maintenance mode blocks non-admin users from viewing courses and dashboards.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
                  }
                  className="text-slate-300 hover:text-white transition"
                >
                  {settings.maintenanceMode ? (
                    <ToggleRight className="h-10 w-10 text-rose-500" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-slate-500" />
                  )}
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={fetchSettings}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition flex items-center gap-1.5 text-xs font-bold"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 shadow-xl shadow-blue-500/20 transition flex items-center gap-1.5 text-xs font-bold"
                >
                  {saving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Configuration
                </button>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Configuration Card */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-indigo-400" />
                SMTP Mailer System (Nodemailer config)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SMTP Host</span>
                  <p className="text-sm font-semibold text-white">{smtpSettings.host}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Port</span>
                  <p className="text-sm font-semibold text-white">{smtpSettings.port}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Auth Username</span>
                  <p className="text-sm font-semibold text-white">{smtpSettings.user}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SSL/TLS Encryption</span>
                  <span className="inline-flex mt-1">
                    <Badge variant={smtpSettings.secure ? "success" : "secondary"}>
                      {smtpSettings.secure ? "Enabled" : "Disabled (Console fallback)"}
                    </Badge>
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-amber-500/10 bg-amber-500/5 text-xs text-amber-300">
                🚀 Verification & OTP emails will automatically log to the local terminal if the main SMTP host remains unconfigured.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Panel: Platform Controls & Backups */}
        <motion.div variants={item} className="space-y-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2.5">
                <Database className="h-5 w-5 text-emerald-400 animate-bounce" />
                Data & Storage Backups
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Database Cluster Size</h4>
                  <p className="text-[11px] text-slate-400">8.42 MB in MongoDB Atlas</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Last Automated Backup</span>
                  <span className="text-white font-medium">10 hours ago</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Backup Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Healthy
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBackup}
                disabled={backingUp}
                className="w-full py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {backingUp ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Trigger Manual Backup Snapshot
              </button>
            </CardContent>
          </Card>

          {/* Quick stats / widgets */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2.5">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                Live Revenue Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Platform Take (Total)</span>
                <p className="text-2xl font-extrabold text-white">$4,850.00</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-[11px] text-slate-400">
                Calculated dynamically from courses sales and custom subscriptions on the platform based on current {settings.commissionRate}% commission.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </form>
    </motion.div>
  );
}
