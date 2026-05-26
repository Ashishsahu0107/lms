import React, { useState } from "react";
import { ChevronLeft, Key, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function SecuritySettings({
  onBack,
  settings,
  onUpdateSettings,
}) {
  const [sessionLimit, setSessionLimit] = useState(3);
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [uploadSizeMB, setUploadSizeMB] = useState(settings?.allowedUploadSizeMB || 100);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setMessage("");
      await onUpdateSettings({ allowedUploadSizeMB: uploadSizeMB });
      setMessage("Security configurations successfully saved and updated!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update security configurations.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6" id="security-settings-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Hardening Security Settings</h2>
      </div>

      <Card className="max-w-xl mx-auto hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" /> Platform Security Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            {message && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs rounded-lg font-semibold">
                {message}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Max Sessions Per User</label>
              <Input
                type="number"
                value={sessionLimit}
                onChange={(e) => setSessionLimit(Number(e.target.value))}
                min={1}
                max={10}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Locks accounts to a specific number of simultaneous active logins.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Min Password Length</label>
              <Input
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                min={6}
                max={30}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Ensures complexity constraints on new password registration.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Allowed Upload File Size Limit (MB)</label>
              <Input
                type="number"
                value={uploadSizeMB}
                onChange={(e) => setUploadSizeMB(Number(e.target.value))}
                min={5}
                max={500}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Prevents server overload by capping teacher/student PDF upload attachments sizes.</p>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                type="submit"
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm text-xs"
              >
                {updating ? "Saving rules..." : "Save Rules Configuration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
