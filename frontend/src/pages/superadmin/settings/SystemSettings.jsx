import { useState } from "react";
import { Save, Server, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function SystemSettings({ settings, onSave }) {
  const [uploadSize, setUploadSize] = useState(
    settings?.allowedUploadSizeMB || 100,
  );
  const [fileFormats, setFileFormats] = useState(
    ".pdf, .docx, .mp4, .jpg, .png",
  );
  const [rateLimit, setRateLimit] = useState(60);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      await onSave({ allowedUploadSizeMB: uploadSize });
      setMessage("Advanced server parameters saved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save advanced settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      id="system-settings-root"
    >
      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-500" /> Server Performance
            Rules
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
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Max Upload Size (MB)
              </label>
              <Input
                type="number"
                value={uploadSize}
                onChange={(e) => setUploadSize(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Locks down request sizes for all curriculum lessons attachments
                uploads.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Allowed File Extensions
              </label>
              <Input
                value={fileFormats}
                onChange={(e) => setFileFormats(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Restricts submissions and uploads to verified document formats.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Rate Limiting (requests/min per IP)
              </label>
              <Input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Throttles aggressive bot client requests to preserve node
                backend resources.
              </p>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm text-xs"
              >
                <Save className="h-4 w-4" />{" "}
                {saving ? "Saving rules..." : "Save Server Rules"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md border border-border bg-card flex flex-col justify-between">
        <div>
          <CardHeader>
            <CardTitle className="text-base text-foreground font-bold text-red-500">
              Platform Maintenance Zones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <h4 className="font-bold text-sm text-foreground">
                Clear Temporary Storage Caches
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Deletes server side temporary uploads and builds chunks to free
                up space immediately.
              </p>
              <Button
                variant="outline"
                className="mt-3 text-red-500 border-red-500/20 hover:bg-red-500/5 text-xs font-semibold"
              >
                Wipe Caches
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <h4 className="font-bold text-sm text-foreground">
                Database Schema Reset
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Caution: Deletes all platform users, transactions, lessons, and
                records. Cannot be recovered.
              </p>
              <Button
                variant="outline"
                className="mt-3 text-red-500 border-red-500/20 hover:bg-red-500/5 text-xs font-semibold"
                disabled
              >
                Wipe Entire Database
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
