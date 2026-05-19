import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Play, CheckCircle2, Users, Star, ChevronLeft,
  ChevronRight, FileText, Download, Award, BarChart2, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ProgressBar } from "../../../components/ui/ProgressBar";

const dummyCourse = {
  title: "Advanced JavaScript",
  instructor: { name: "Dr. James Wilson", avatar: "", bio: "Senior Software Engineer with 15 years of experience" },
  category: "Programming",
  rating: 4.8,
  students: 1245,
  duration: "32 hours",
  lectures: 24,
  difficulty: "intermediate",
  thumbnail: "https://images.unsplash.com/photo-1627392662291-4c2ac9c424e9?w=800",
  description: "Master advanced JavaScript concepts including closures, prototypes, async programming, and design patterns.",
  about: "This comprehensive course takes you from intermediate to advanced JavaScript developer. You'll learn powerful patterns and techniques used in production applications.",
  progress: 45,
  enrolled: true,
  completedLectures: 11,
  sections: [
    {
      title: "Getting Started",
      lectures: [
        { id: 1, title: "Course Introduction", duration: 720, completed: true },
        { id: 2, title: "Setting Up Environment", duration: 900, completed: true },
        { id: 3, title: "JavaScript Fundamentals Review", duration: 1200, completed: true },
      ]
    },
    {
      title: "Advanced Functions",
      lectures: [
        { id: 4, title: "Closures Deep Dive", duration: 1500, completed: true },
        { id: 5, title: "Currying and Partial Application", duration: 1100, completed: true },
        { id: 6, title: "Memoization Patterns", duration: 950, completed: true },
        { id: 7, title: "Function Composition", duration: 1200, completed: true },
      ]
    },
    {
      title: "Asynchronous JavaScript",
      lectures: [
        { id: 8, title: "Callbacks and Callback Hell", duration: 800, completed: true },
        { id: 9, title: "Promises Deep Dive", duration: 1400, completed: false },
        { id: 10, title: "Async/Await Patterns", duration: 1300, completed: false },
        { id: 11, title: "Error Handling Strategies", duration: 1000, completed: false },
      ]
    },
    {
      title: "Design Patterns",
      lectures: [
        { id: 12, title: "Module Pattern", duration: 900, completed: false },
        { id: 13, title: "Observer Pattern", duration: 1100, completed: false },
        { id: 14, title: "Factory Pattern", duration: 850, completed: false },
        { id: 15, title: "Singleton Pattern", duration: 750, completed: false },
      ]
    }
  ]
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function CourseDetails() {
  const { id } = useParams();
  const [course] = useState(dummyCourse);
  const [expandedSections, setExpandedSections] = useState([true, true, true]);

  const totalDuration = course.sections.reduce((acc, sec) =>
    acc + sec.lectures.reduce((a, l) => a + l.duration, 0), 0);
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const toggleSection = (idx) => {
    setExpandedSections(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Section */}
      <motion.div variants={item} className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1 text-white space-y-4">
            <Badge className="bg-white/20 text-white border-0">{course.category}</Badge>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-white/80 line-clamp-2">{course.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400" /> {course.rating} rating</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students.toLocaleString()} students</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-semibold">{course.instructor.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-white">{course.instructor.name}</p>
                <p className="text-xs text-white/70">Instructor</p>
              </div>
            </div>
          </div>
          <div className="md:w-80">
            <Card className="overflow-hidden shadow-2xl">
              <div className="relative h-44">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                    <Play className="h-6 w-6 text-primary ml-1" />
                  </button>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                {course.enrolled ? (
                  <>
                    <ProgressBar value={course.progress} size="md" showLabel />
                    <Button className="w-full gap-2" size="lg">
                      <Play className="h-4 w-4" /> Continue Learning
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" size="lg">Enroll Now</Button>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Lectures</span><span className="font-medium">{course.lectures}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{course.duration}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span className="font-medium capitalize">{course.difficulty}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Total Lectures", value: course.lectures },
          { icon: CheckCircle2, label: "Completed", value: course.completedLectures },
          { icon: Clock, label: "Total Duration", value: formatDuration(totalDuration) },
          { icon: Award, label: "Certificate", value: course.enrolled ? "Available" : "After Completion" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-xl bg-primary/10"><stat.icon className="h-6 w-6 text-primary" /></div>
              <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Curriculum */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div variants={item}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Course Curriculum</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {course.sections.map((section, sIdx) => {
                  const completedInSection = section.lectures.filter(l => l.completed).length;
                  return (
                    <div key={sIdx} className="border rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                        onClick={() => toggleSection(sIdx)}
                      >
                        <div className="text-left">
                          <p className="font-semibold">{section.title}</p>
                          <p className="text-sm text-muted-foreground">{section.lectures.length} lectures · {completedInSection}/{section.lectures.length} completed</p>
                        </div>
                        {expandedSections[sIdx] ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                      {expandedSections[sIdx] && (
                        <div className="divide-y">
                          {section.lectures.map(lecture => (
                            <Link
                              key={lecture.id}
                              to={`/student/course/${id}/player/${lecture.id}`}
                              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lecture.completed ? "bg-emerald-100" : "bg-muted"}`}>
                                {lecture.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Play className="h-3 w-3 text-muted-foreground" />}
                              </div>
                              <span className="flex-1 text-sm group-hover:text-primary transition-colors">{lecture.title}</span>
                              <span className="text-xs text-muted-foreground">{formatDuration(lecture.duration)}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: About */}
        <div className="space-y-4">
          <motion.div variants={item}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />About This Course</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{course.about}</p>
                <div>
                  <p className="font-medium mb-2">What you'll learn</p>
                  <ul className="space-y-2 text-sm">
                    {["Advanced JavaScript patterns", "Async programming mastery", "Real-world project实战", "Design patterns in JS"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Syllabus</Button>
                  <Button variant="outline" size="sm" className="gap-2"><MessageSquare className="h-4 w-4" />Ask Instructor</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}