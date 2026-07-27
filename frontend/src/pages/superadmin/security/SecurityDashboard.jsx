import { motion } from "framer-motion";
import {
  Shield,
  Monitor,
  AlertTriangle,
  Ban,
  Key,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function SecurityDashboard({ stats, onNavigateToView }) {
  const securitySections = [
    {
      id: "sessions",
      label: "Active User Sessions",
      icon: Monitor,
      desc: "Audit and terminate live logged-in user accounts.",
      color: "blue",
    },
    {
      id: "audit",
      label: "Access & Audit Logs",
      icon: Activity,
      desc: "Deep telemetry traces mapping logins, failures, and updates.",
      color: "indigo",
    },
    {
      id: "permissions",
      label: "Role Permissions",
      icon: Shield,
      desc: "Inspect granular role based authorization parameters.",
      color: "emerald",
    },
    {
      id: "settings",
      label: "Hardening Settings",
      icon: Key,
      desc: "Configure upload restrictions, sessions limits, and password constraints.",
      color: "purple",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
      id="security-dashboard-root"
    >
      {/* KPI Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Active Online Sessions",
            value: stats?.activeSessionsCount || "3",
            icon: Monitor,
            color: "blue",
          },
          {
            label: "Failed Auth Attempts (24h)",
            value: stats?.failedAttemptsCount || "1",
            icon: AlertTriangle,
            color: "amber",
          },
          {
            label: "Blocked IP Addresses",
            value: stats?.blockedIpsCount || "2",
            icon: Ban,
            color: "red",
          },
          {
            label: "Platform Hardening Score",
            value: "98%",
            icon: Shield,
            color: "emerald",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="hover:shadow-sm border border-border bg-card"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Grid of Options */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {securitySections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Card
              key={sec.id}
              className="p-6 hover:shadow-lg hover:border-blue-500/20 border transition-all flex flex-col justify-between h-full bg-card"
            >
              <div className="space-y-4">
                <div
                  className={`p-3 w-fit rounded-xl bg-${sec.color}-500/10 text-${sec.color}-500`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {sec.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sec.desc}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit mt-6 text-xs font-semibold"
                onClick={() => onNavigateToView(sec.id)}
              >
                Configure {sec.label}
              </Button>
            </Card>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
