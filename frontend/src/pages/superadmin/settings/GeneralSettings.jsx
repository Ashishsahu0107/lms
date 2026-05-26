import React, { useState } from "react";
import { Save, Building, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function GeneralSettings({
  settings,
  onSave,
}) {
  const [platformName, setPlatformName] = useState(settings?.platformName || "LMS Pro");
  const [commissionRate, setCommissionRate] = useState(settings?.commissionRate || 20);
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode || false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      await onSave({
        platformName,
        commissionRate,
        maintenanceMode,
      });
      setMessage("General settings saved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save general settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="general-settings-root">
      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-500" /> Platform Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs rounded-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {message}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform Title Name</label>
              <Input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="e.g. Academy Pro"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform Commission Rate (%)</label>
              <Input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                min={0}
                max={100}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Platform fee deducted from all student course enrollments.</p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
              <div>
                <p className="font-semibold text-sm text-foreground">Maintenance Mode Gate</p>
                <p className="text-[11px] text-muted-foreground">Locks down student access to only view a landing screen.</p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="text-blue-500"
              >
                {maintenanceMode ? (
                  <ToggleRight className="h-8 w-8 text-red-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm text-xs"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold">Configuration Audits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            All general parameters configured here are mapped globally across billing controllers, user authentication routes, and lesson access gates.
          </p>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">Global App Name</span>
              <span className="font-bold text-foreground">{settings?.platformName || "LMS Pro"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">Revenue Split ratio</span>
              <span className="font-bold text-emerald-600">
                {100 - (settings?.commissionRate ?? 20)}% Instructor / {(settings?.commissionRate ?? 20)}% App
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground font-medium">System Status Code</span>
              <span className="font-bold text-blue-500">
                {settings?.maintenanceMode ? "MAINTENANCE ACTIVE" : "ONLINE & OPERATIONAL"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
