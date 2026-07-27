import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Award, Check } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import toast from "react-hot-toast";

export default function CertificateTemplates() {
  const [activeTemplate, setActiveTemplate] = useState("Premium");

  const templates = [
    {
      name: "Classic",
      desc: "Traditional style with elegant borders and serif typography.",
      border: "border-[16px] border-amber-900/10",
      bg: "bg-stone-50",
      text: "font-serif text-stone-900",
      accent: "text-amber-800",
    },
    {
      name: "Modern",
      desc: "Clean layout, dynamic geometries and high contrast layout.",
      border: "border-[12px] border-indigo-500/20",
      bg: "bg-slate-50",
      text: "font-sans text-slate-900",
      accent: "text-indigo-600",
    },
    {
      name: "Premium",
      desc: "Vibrant details, gold seals, and sleek glass details.",
      border: "border-[12px] border-amber-500/20",
      bg: "bg-amber-50/10",
      text: "font-serif text-slate-800",
      accent: "text-amber-600",
    },
  ];

  const handleSelect = (name) => {
    setActiveTemplate(name);
    toast.success(`Active layout updated to ${name}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="admin-templates-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/certificates"
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Certificate Templates
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage layouts and visual structures for generated credentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <Card
            key={tpl.name}
            className={`border-border shadow-sm overflow-hidden hover:shadow-md transition-all ${
              activeTemplate === tpl.name ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            <div
              className={`p-8 ${tpl.bg} ${tpl.border} aspect-[4/3] flex flex-col justify-between text-center`}
            >
              <div className="space-y-1">
                <Award className={`h-8 w-8 mx-auto ${tpl.accent}`} />
                <h4
                  className={`text-sm font-extrabold uppercase tracking-wider ${tpl.text}`}
                >
                  CERTIFICATE
                </h4>
              </div>
              <div className="space-y-0.5">
                <div className="w-10 h-0.5 bg-border mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Granted To
                </p>
                <p className={`text-xs font-bold ${tpl.text}`}>Jane Doe</p>
              </div>
              <div className="flex justify-between items-end text-[7px] text-muted-foreground font-mono">
                <span>ID: CERT-1234</span>
                <span>ISSUE DATE</span>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center justify-between">
                  {tpl.name} Style
                  {activeTemplate === tpl.name && (
                    <span className="p-1 rounded-full bg-indigo-100 text-indigo-600">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{tpl.desc}</p>
              </div>
              <Button
                variant={activeTemplate === tpl.name ? "default" : "outline"}
                className={`w-full text-xs font-semibold ${
                  activeTemplate === tpl.name ? "bg-indigo-600 text-white" : ""
                }`}
                onClick={() => handleSelect(tpl.name)}
              >
                {activeTemplate === tpl.name
                  ? "Currently Active"
                  : "Select Style"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
