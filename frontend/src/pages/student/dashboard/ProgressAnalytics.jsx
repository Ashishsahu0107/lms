import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchStudentInsights, fetchProgressDetails } from "../../../redux/slices/progressSlice";
import { getEnrolledCourses } from "../../../services/studentService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Zap, Flame, Award, BookOpen, Clock, Sparkles,
  CheckCircle2, PlayCircle, ChevronDown, ChevronUp, FileText,
  TrendingUp, Activity, CheckSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Button } from "../../../components/ui/Button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function ProgressAnalytics() {
  const dispatch = useDispatch();
  const { insights, progressDetails, loading } = useSelector((state) => state.progress);

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [expandedModule, setExpandedModule] = useState(null);

  // Load user courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await getEnrolledCourses();
        if (res && res.success) {
          const list = Array.isArray(res.data) ? res.data : res.data?.courses || [];
          setCourses(list);
          if (list.length > 0) {
            setSelectedCourseId(list[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load enrolled courses:", err);
      }
    }
    loadCourses();
    dispatch(fetchStudentInsights());
  }, [dispatch]);

  // Load progress details when selected course changes
  useEffect(() => {
    if (selectedCourseId) {
      dispatch(fetchProgressDetails(selectedCourseId));
    }
  }, [selectedCourseId, dispatch]);

  const level = Math.floor((insights?.xp || 0) / 500) + 1;
  const currentXPInLevel = (insights?.xp || 0) % 500;
  const xpPercentage = Math.round((currentXPInLevel / 500) * 100);

  const toggleModule = (id) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  const badgeColors = {
    "Quick Starter": "bg-blue-500/10 border-blue-500/20 text-blue-400",
    "Consistent Learner": "bg-orange-500/10 border-orange-500/20 text-orange-400",
    "Quiz Master": "bg-amber-500/10 border-amber-500/20 text-amber-400",
    "Syllabus Conqueror": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    "Perfect Score": "bg-purple-500/10 border-purple-500/20 text-purple-400"
  };

  const badgeDescriptions = {
    "Quick Starter": "Completed first syllabus topic",
    "Consistent Learner": "Completed lessons 3 days in a row",
    "Quiz Master": "Scored 90%+ in any evaluation",
    "Syllabus Conqueror": "Completed a course fully",
    "Perfect Score": "Scored 100% on a quiz or assignment"
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6"
      id="student-analytics-cockpit"
    >
      {/* Header Banner */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            My Learning Cockpit
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Syllabus completions, verified credentials, and gamified study statistics</p>
        </div>
        {courses.length > 0 && (
          <div className="flex items-center gap-2 bg-card border rounded-xl px-3 py-1.5 shadow-sm">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer border-0"
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id} className="bg-card text-foreground">
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Gamification Indicator Row */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* XP Progress Card */}
        <Card className="border border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-transparent shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
              <Zap className="h-7 w-7" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest">Scholar Level {level}</span>
                <span className="text-xs text-muted-foreground font-semibold">{currentXPInLevel} / 500 XP</span>
              </div>
              <ProgressBar value={xpPercentage} size="sm" className="[&>div]:bg-indigo-600" />
              <p className="text-[10px] text-muted-foreground font-medium">Earn {500 - currentXPInLevel} more XP to reach level {level + 1}!</p>
            </div>
          </CardContent>
        </Card>

        {/* Streak Indicator Card */}
        <Card className="border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-transparent shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 animate-pulse">
              <Flame className="h-7 w-7" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest">Active Study Streak</span>
              <p className="text-2xl font-black text-foreground">{insights?.streak || 0} Days</p>
              <p className="text-xs text-muted-foreground">Complete a lesson daily to fuel the streak fire!</p>
            </div>
          </CardContent>
        </Card>

        {/* Badges Counts Card */}
        <Card className="border border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Trophy className="h-7 w-7" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">Milestones Unlocked</span>
              <p className="text-2xl font-black text-foreground">{insights?.badgesCount || 0} Badges</p>
              <p className="text-xs text-muted-foreground">Check your badge catalog to claim exclusive coupons!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Double Layout: Insights and Badges / Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights Log timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500" /> Smart Learning Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights?.insights?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No study patterns collected yet. Check in tomorrow!</p>
            ) : (
              insights?.insights?.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border bg-muted/30 text-xs font-semibold leading-relaxed border-l-4 border-l-indigo-500 text-foreground">
                  {insight}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Badge inventory shelf */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-amber-500" /> Milestone Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {Object.keys(badgeDescriptions).map((badge) => {
                const unlocked = insights?.badges?.includes(badge);
                return (
                  <div
                    key={badge}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      unlocked
                        ? `${badgeColors[badge]} bg-opacity-30 shadow-sm`
                        : "bg-muted/10 border-border/40 opacity-40 grayscale"
                    }`}
                  >
                    <div className="rounded-full bg-white/5 p-2 border border-current shrink-0">
                      <Award className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground line-clamp-1">{badge}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{badgeDescriptions[badge]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress detail charts */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly study hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-indigo-500" /> Weekly Commitments (Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights?.weeklyStudy || []}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="month" className="text-[10px] font-medium text-muted-foreground" />
                  <YAxis className="text-[10px] font-medium text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} fill="url(#studyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quiz score accuracy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-amber-500" /> Quiz Accuracy Timeline (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insights?.scoreTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="name" className="text-[10px] font-medium text-muted-foreground" />
                  <YAxis domain={[0, 100]} className="text-[10px] font-medium text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#fff", stroke: "#f59e0b", strokeWidth: 1.5, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course detailed module completion roadmap */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules completion checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Module Progress Map
            </h2>
            {progressDetails && (
              <Badge className="bg-indigo-600 text-white font-bold uppercase py-0.5 px-2 text-[10px]">
                Overall Completion: {progressDetails.overallProgress}%
              </Badge>
            )}
          </div>

          <div className="space-y-3 bg-card border rounded-2xl p-4 shadow-sm">
            {progressDetails?.modules?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No syllabus modules defined in this curriculum.</p>
            ) : (
              progressDetails?.modules?.map((mod) => {
                const isOpen = expandedModule === mod._id;
                return (
                  <div key={mod._id} className="border rounded-xl overflow-hidden bg-card transition-all">
                    <button
                      onClick={() => toggleModule(mod._id)}
                      className="w-full flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/20 text-left transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-sm font-bold text-foreground truncate">{mod.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="w-24 shrink-0">
                            <ProgressBar value={mod.completionPercentage} size="xs" className="[&>div]:bg-emerald-500" />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">{mod.completionPercentage}% Done</span>
                        </div>
                      </div>
                      <div>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t"
                        >
                          <div className="divide-y divide-border/60">
                            {mod.topics?.map((topic) => (
                              <div key={topic._id} className="flex items-center justify-between p-3.5 pl-6 text-xs hover:bg-muted/5 transition-colors">
                                <span className="font-semibold text-foreground/80 truncate max-w-xs">{topic.title}</span>
                                <div className="flex items-center gap-2">
                                  {topic.completed ? (
                                    <Badge className="bg-emerald-600 text-white gap-1 flex items-center font-bold px-2 py-0.5 rounded-full text-[9px] uppercase border-0">
                                      <CheckCircle2 className="h-3 w-3" /> Done
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-border text-muted-foreground/60 gap-1 flex items-center font-bold px-2 py-0.5 rounded-full text-[9px] uppercase">
                                      <PlayCircle className="h-3 w-3" /> Pending
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quizzes and Assignments lists */}
        <div className="space-y-6">
          {/* Quiz submissions scores */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-amber-500" /> Quiz Submissions
            </h2>
            <div className="bg-card border rounded-2xl p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {progressDetails?.quizScores?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No quizzes configured in this course.</p>
              ) : (
                progressDetails?.quizScores?.map((q) => (
                  <div key={q._id} className="p-3 border rounded-xl bg-muted/10 space-y-1.5">
                    <p className="text-xs font-bold text-foreground truncate">{q.title}</p>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-semibold">Marks: {q.score !== null ? `${q.score}/${q.totalMarks}` : "—"}</span>
                      {q.score !== null ? (
                        <Badge className={`border-0 text-[8px] font-black uppercase rounded-full ${q.status === "Passed" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                          {q.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-border text-[8px] font-bold uppercase rounded-full">
                          Unattempted
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assignment grading feed */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" /> Assignment Feedback
            </h2>
            <div className="bg-card border rounded-2xl p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {progressDetails?.assignmentScores?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No assignments configured in this course.</p>
              ) : (
                progressDetails?.assignmentScores?.map((a) => (
                  <div key={a._id} className="p-3 border rounded-xl bg-muted/10 space-y-2">
                    <p className="text-xs font-bold text-foreground truncate">{a.title}</p>
                    <div className="flex justify-between items-center text-[10px] border-b pb-1.5 border-border/40">
                      <span className="text-muted-foreground font-semibold">Grade: {a.marks !== null ? `${a.marks}/${a.totalMarks}` : "—"}</span>
                      <Badge className={`border-0 text-[8px] font-black uppercase rounded-full ${a.status === "graded" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
                        {a.status}
                      </Badge>
                    </div>
                    {a.feedback && (
                      <p className="text-[10px] text-muted-foreground italic leading-relaxed bg-white/5 p-1.5 rounded border border-border">
                        " {a.feedback} "
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
