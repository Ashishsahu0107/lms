import { useState } from "react";
import { Save, Palette, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import ThemeToggle from "../../../components/common/ThemeToggle";

export default function ThemeSettings() {
  const [accentColor, setAccentColor] = useState("blue");

  const accents = [
    { id: "blue", color: "#3b82f6", label: "Classic Indigo" },
    { id: "emerald", color: "#10b981", label: "Forest Emerald" },
    { id: "purple", color: "#8b5cf6", label: "Vibrant Violet" },
    { id: "rose", color: "#f43f5e", label: "Dynamic Ruby" },
  ];

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      id="theme-settings-root"
    >
      <Card className="hover:shadow-md border border-base-300 bg-base-100/60">
        <CardHeader>
          <CardTitle className="text-base text-base-content font-bold flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" /> Platform Color Themes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider block">
              Interface Mode
            </label>
            <ThemeToggle variant="settings" />
          </div>

          <div className="space-y-3 pt-4 border-t border-base-300">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider block">
              Accent Glow Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {accents.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccentColor(acc.id)}
                  className={`p-3 rounded-xl border text-center transition-all flex items-center justify-between ${
                    accentColor === acc.id
                      ? "border-primary bg-primary/5 text-base-content"
                      : "border-base-300 hover:border-primary/20 text-base-content/60 bg-base-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                    <span className="text-xs font-semibold text-base-content">
                      {acc.id}
                    </span>
                  </div>
                  {accentColor === acc.id && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-base-300 flex justify-end">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-content font-semibold shadow-sm text-xs">
              <Save className="h-4 w-4" /> Save Appearance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md border border-base-300 bg-base-100/60 flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-base text-base-content font-bold">
            Theme Previews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-2xl border border-base-300 bg-gradient-to-br from-base-100 to-base-200 relative overflow-hidden shadow-sm min-h-[160px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sample Tag
                </span>
                <h4 className="font-bold text-base text-base-content mt-2">
                  Interactive Dashboard Card
                </h4>
              </div>
              <Palette className="h-5 w-5 text-base-content/60" />
            </div>
            <p className="text-xs text-base-content/60 leading-relaxed mt-2">
              This card renders accross light or dark glassmorphic backdrops,
              glowing smoothly with accent color coordinates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
