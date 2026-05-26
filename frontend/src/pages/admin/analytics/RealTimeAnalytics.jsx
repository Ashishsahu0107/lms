import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, CheckCircle2, UserPlus, CreditCard, Award, Wifi, WifiOff } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { useSocket } from "../../../context/SocketContext";
import { getRealtimeAnalytics } from "../../../services/adminAnalyticsService";

export default function RealTimeAnalytics() {
  const { socket, isConnected } = useSocket();
  const [metrics, setMetrics] = useState({
    activeUsers: 14,
    enrollments: 4,
    revenue: 350,
    quizzes: 8
  });
  const [liveActivities, setLiveActivities] = useState([
    { id: 1, type: "userJoined", text: "New Student registered on platform", time: "Just now", icon: UserPlus, color: "text-blue-400" },
    { id: 2, type: "paymentCompleted", text: "Subscription Premium Payment processed ($149)", time: "2m ago", icon: CreditCard, color: "text-emerald-400" },
    { id: 3, type: "quizSubmitted", text: "Ashish Sahu completed 'MongoDB Aggregation' Quiz with 96%", time: "5m ago", icon: Award, color: "text-amber-400" }
  ]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buffer ref to maintain charting numbers
  const activityCountRef = useRef(0);

  // Load initial 24h totals
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await getRealtimeAnalytics();
        if (res && res.success) {
          setMetrics((prev) => ({
            ...prev,
            activeUsers: res.data.onlineCount,
            ...res.data.metrics24h
          }));
        }
      } catch (err) {
        console.error("Failed to load realtime initial state:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();

    // Initialize chart points
    const now = new Date();
    const initialPoints = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3000);
      initialPoints.push({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        events: Math.floor(Math.random() * 2)
      });
    }
    setChartData(initialPoints);
  }, []);

  // Set up charting intervals (adds standard heartbeat charting data every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setChartData((prev) => {
        const next = [...prev.slice(1)];
        // Add chart point representing events count in the last 3s window
        next.push({
          time: timeStr,
          events: activityCountRef.current
        });
        // reset window counter
        activityCountRef.current = 0;
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Listen to Socket Broadcasts
  useEffect(() => {
    if (!socket) return;

    const handleStudentJoined = (data) => {
      const name = data?.name || data?.studentName || "A student";
      const course = data?.courseTitle || "a new course";
      
      activityCountRef.current += 1;
      setMetrics(prev => ({ ...prev, enrollments: prev.enrollments + 1 }));
      
      setLiveActivities(prev => [
        {
          id: Date.now(),
          type: "enrollmentCreated",
          text: `${name} enrolled in ${course}`,
          time: "Just now",
          icon: UserPlus,
          color: "text-blue-400"
        },
        ...prev.slice(0, 15)
      ]);
    };

    const handleQuizSubmitted = (data) => {
      const name = data?.studentName || "A student";
      const score = data?.score !== undefined ? `${data.score}%` : "completed";
      
      activityCountRef.current += 1;
      setMetrics(prev => ({ ...prev, quizzes: prev.quizzes + 1 }));
      
      setLiveActivities(prev => [
        {
          id: Date.now(),
          type: "quizSubmitted",
          text: `${name} submitted Quiz with score: ${score}`,
          time: "Just now",
          icon: Award,
          color: "text-amber-400"
        },
        ...prev.slice(0, 15)
      ]);
    };

    const handlePaymentCompleted = (data) => {
      const amount = data?.amount || 99;
      
      activityCountRef.current += 1;
      setMetrics(prev => ({
        ...prev,
        revenue: prev.revenue + amount
      }));
      
      setLiveActivities(prev => [
        {
          id: Date.now(),
          type: "paymentCompleted",
          text: `Payment of $${amount} successfully captured`,
          time: "Just now",
          icon: CreditCard,
          color: "text-emerald-400"
        },
        ...prev.slice(0, 15)
      ]);
    };

    const handleAttendanceUpdated = (data) => {
      activityCountRef.current += 1;
      setLiveActivities(prev => [
        {
          id: Date.now(),
          type: "attendanceMarked",
          text: `Attendance roll registered for course`,
          time: "Just now",
          icon: CheckCircle2,
          color: "text-purple-400"
        },
        ...prev.slice(0, 15)
      ]);
    };

    socket.on("studentJoined", handleStudentJoined);
    socket.on("quizSubmitted", handleQuizSubmitted);
    socket.on("paymentCompleted", handlePaymentCompleted);
    socket.on("attendanceUpdated", handleAttendanceUpdated);

    // Backward compatibility aliases
    socket.on("userJoined", handleStudentJoined);
    socket.on("enrollmentCreated", handleStudentJoined);
    socket.on("attendanceMarked", handleAttendanceUpdated);

    return () => {
      socket.off("studentJoined", handleStudentJoined);
      socket.off("quizSubmitted", handleQuizSubmitted);
      socket.off("paymentCompleted", handlePaymentCompleted);
      socket.off("attendanceUpdated", handleAttendanceUpdated);
      socket.off("userJoined", handleStudentJoined);
      socket.off("enrollmentCreated", handleStudentJoined);
      socket.off("attendanceMarked", handleAttendanceUpdated);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {/* Socket Connection Panel */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400 animate-pulse" /> Live Telemetry Sockets Monitor
          </h2>
          <p className="text-xs text-white/50">Streaming WebSocket analytics and activity streams natively.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-400 animate-pulse" /> Sockets Connected
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-rose-400" /> Sockets Offline
              </>
            )}
          </div>
        </div>
      </div>

      {/* Realtime 24h metrics indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-md p-5 flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Active online Sockets</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.activeUsers}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
            <Wifi className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-md p-5 flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Enrollments (24h)</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.enrollments}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-500/15 flex items-center justify-center border border-purple-500/20">
            <UserPlus className="h-5 w-5 text-purple-400" />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-md p-5 flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Revenue Volume (24h)</span>
            <p className="text-2xl font-black text-white mt-1">${metrics.revenue}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
            <CreditCard className="h-5 w-5 text-emerald-400" />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-md p-5 flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Quiz submissions (24h)</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.quizzes}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
            <Award className="h-5 w-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Grid: Streaming Chart + Timeline Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streaming area chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-blue-400 animate-pulse" /> Operations Volume Stream (per 3s)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff05" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#ffffff30" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#333" }} />
                <Area type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#streamGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Timeline Feed */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col h-[400px]">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Live Websockets Activity Timeline
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
            <AnimatePresence initial={false}>
              {liveActivities.map((act) => {
                const IconComponent = act.icon || Activity;
                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex gap-3.5 border-l-2 border-white/10 pl-4 relative"
                  >
                    {/* Bullet marker */}
                    <div className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                    
                    <div className={`mt-0.5 rounded-lg border border-white/5 bg-white/5 p-2 ${act.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-relaxed">{act.text}</p>
                      <span className="text-[10px] text-white/35 font-medium">{act.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
