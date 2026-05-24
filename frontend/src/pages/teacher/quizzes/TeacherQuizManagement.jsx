import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, HelpCircle, CheckCircle, Clock, Edit3, Trash2, Award
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import toast from "react-hot-toast";

const initialQuizzes = [
  { id: "Q1", title: "JavaScript Basics Quiz", course: "Advanced JavaScript", questionsCount: 15, duration: 20, avgScore: 82, status: "published" },
  { id: "Q2", title: "Python Control Flow Assessment", course: "Python Fundamentals", questionsCount: 10, duration: 15, avgScore: 78, status: "published" },
  { id: "Q3", title: "Responsive Layouts Challenge", course: "UI/UX Design", questionsCount: 20, duration: 30, avgScore: null, status: "draft" },
];

export default function TeacherQuizManagement() {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("Advanced JavaScript");
  const [questionsCount, setQuestionsCount] = useState(10);
  const [duration, setDuration] = useState(15);

  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newQuiz = {
      id: `Q${Date.now()}`,
      title,
      course,
      questionsCount: Number(questionsCount),
      duration: Number(duration),
      avgScore: null,
      status: "draft",
    };

    setQuizzes([newQuiz, ...quizzes]);
    setTitle("");
    setShowAddModal(false);
    toast.success("Quiz created successfully as draft!");
  };

  const handleDeleteQuiz = (id) => {
    setQuizzes(quizzes.filter(q => q.id !== id));
    toast.success("Quiz deleted successfully!");
  };

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      id="teacher-quiz-module-container"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quiz Management</h1>
          <p className="text-sm text-muted-foreground">Build, manage, and grade class quizzes.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2" id="create-quiz-trigger">
          <Plus className="h-4 w-4" /> Create Quiz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><HelpCircle className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Quizzes</p>
              <h3 className="text-xl font-bold">{quizzes.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Active Assessments</p>
              <h3 className="text-xl font-bold">{quizzes.filter(q => q.status === "published").length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl"><Award className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Average Completion Score</p>
              <h3 className="text-xl font-bold">80%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4 bg-card border border-muted p-4 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-10 border-muted"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Quizzes Table Card */}
      <Card className="border-muted shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-muted">
                <th>Quiz ID</th>
                <th>Title</th>
                <th>Course</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Avg. Score</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                    No quizzes found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-muted/50 hover:bg-primary/5 transition-colors">
                    <td><span className="font-semibold text-primary">{quiz.id}</span></td>
                    <td><span className="font-medium text-foreground">{quiz.title}</span></td>
                    <td><span className="text-sm text-muted-foreground">{quiz.course}</span></td>
                    <td><Badge variant="ghost" className="border-muted">{quiz.questionsCount} Questions</Badge></td>
                    <td>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {quiz.duration} mins
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-sm text-emerald-600">
                        {quiz.avgScore ? `${quiz.avgScore}%` : "—"}
                      </span>
                    </td>
                    <td>
                      <Badge variant={quiz.status === "published" ? "success" : "secondary"}>
                        {quiz.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="hover:text-primary rounded-full"><Edit3 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="hover:text-error rounded-full" onClick={() => handleDeleteQuiz(quiz.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-2xl border border-muted p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <h3 className="font-bold text-lg mb-4">Create New Assessment</h3>
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div>
                  <label className="label text-sm font-semibold mb-1">Quiz Title</label>
                  <Input
                    className="border-muted h-10"
                    placeholder="Enter quiz title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label text-sm font-semibold mb-1">Target Course</label>
                  <select
                    className="select select-bordered border-muted w-full h-10 rounded-xl px-3 bg-card"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="Advanced JavaScript">Advanced JavaScript</option>
                    <option value="Python Fundamentals">Python Fundamentals</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-sm font-semibold mb-1">Questions Count</label>
                    <Input
                      type="number"
                      className="border-muted h-10"
                      value={questionsCount}
                      onChange={(e) => setQuestionsCount(e.target.value)}
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="label text-sm font-semibold mb-1">Duration (Mins)</label>
                    <Input
                      type="number"
                      className="border-muted h-10"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min={1}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t mt-4">
                  <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit">Create Draft</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
