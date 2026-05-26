import React, { useState } from "react";
import { Save, Image, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function BrandingSettings({
  settings,
  onSave,
}) {
  const [logoUrl, setLogoUrl] = useState(settings?.brandingLogo || "https://lmspro.edu/logo.png");
  const [tagline, setTagline] = useState("Transforming Education, One Course at a Time");
  const [contactEmail, setContactEmail] = useState("support@lmspro.edu");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      await onSave({ brandingLogo: logoUrl });
      setMessage("Branding logo and properties updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update branding settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="branding-settings-root">
      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-500" /> Branding Visual Assets
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
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Branding Logo Asset URL</label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://assets.site.com/logo.png"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Marketing Tagline</label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Global Contact Support Email</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm text-xs"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Branding Assets"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md border border-border bg-card flex flex-col justify-between">
        <div>
          <CardHeader>
            <CardTitle className="text-base text-foreground font-bold">Branding Mock Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Mock view of your platform branding logo asset and contact coordinates in headers/footers context:
            </p>
            <div className="p-5 rounded-2xl border border-border bg-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
                LMS
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-foreground">{settings?.platformName || "LMS Pro"}</h4>
                <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{tagline}</p>
                <p className="text-[9px] text-blue-500 font-semibold mt-1">Contact: {contactEmail}</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
