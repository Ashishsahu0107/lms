import React, { useState } from "react";
import { Save, Palette, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export default function ThemeSettings() {
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("blue");

  const themes = [
    { id: "light", label: "Brilliant Light", desc: "Clean borders and bright elements." },
    { id: "dark", label: "Glassmorphic Dark", desc: "Aesthetic deep backdrops with HSL neon glows." },
    { id: "system", label: "System Synced", desc: "Dynamically tracks your operating system colors." },
  ];

  const accents = [
    { id: "blue", color: "#3b82f6", label: "Classic Indigo" },
    { id: "emerald", color: "#10b981", label: "Forest Emerald" },
    { id: "purple", color: "#8b5cf6", label: "Vibrant Violet" },
    { id: "rose", color: "#f43f5e", label: "Dynamic Ruby" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="theme-settings-root">
      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold flex items-center gap-2">
            <Palette className="h-4 w-4 text-blue-500" /> Platform Color Themes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Interface Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTheme === t.id
                      ? "border-blue-500 bg-blue-500/5 text-foreground"
                      : "border-border hover:border-blue-500/20 text-muted-foreground bg-card"
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Accent Glow Color</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {accents.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccentColor(acc.id)}
                  className={`p-3 rounded-xl border text-center transition-all flex items-center justify-between ${
                    accentColor === acc.id
                      ? "border-blue-500 bg-blue-500/5 text-foreground"
                      : "border-border hover:border-blue-500/20 text-muted-foreground bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: acc.color }} />
                    <span className="text-xs font-semibold text-foreground">{acc.id}</span>
                  </div>
                  {accentColor === acc.id && <Check className="h-3.5 w-3.5 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm text-xs">
              <Save className="h-4 w-4" /> Save Appearance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md border border-border bg-card flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold">Theme Previews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-2xl border bg-gradient-to-br from-card to-muted/20 relative overflow-hidden shadow-sm min-h-[160px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sample Tag
                </span>
                <h4 className="font-bold text-base text-foreground mt-2">Interactive Dashboard Card</h4>
              </div>
              <Palette className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              This card renders accross light or dark glassmorphic backdrops, glowing smoothly with accent color coordinates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
