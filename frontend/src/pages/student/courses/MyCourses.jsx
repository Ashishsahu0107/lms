import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Filter, Grid, List, BookOpen, Clock, Star, Play,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/Tabs";

const allCourses = [
  {
    id: 1, title: "Advanced JavaScript", instructor: "Dr. James Wilson",
    category: "Programming", rating: 4.8, students: 1245, duration: "32 hours",
    lessons: 24, progress: 75, thumbnail: "https://images.unsplash.com/photo-1627392662291-4c2ac9c424e9?w=400",
    enrolled: true, certificate: true,
  },
  {
    id: 2, title: "Python for Data Science", instructor: "Prof. Emily Chen",
    category: "Data Science", rating: 4.9, students: 2156, duration: "45 hours",
    lessons: 32, progress: 45, thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0c9359?w=400",
    enrolled: true, certificate: false,
  },
  {
    id: 3, title: "UI/UX Design Fundamentals", instructor: "Sarah Johnson",
    category: "Design", rating: 4.7, students: 876, duration: "28 hours",
    lessons: 18, progress: 20, thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
    enrolled: true, certificate: false,
  },
  {
    id: 4, title: "Machine Learning Basics", instructor: "Dr. Michael Brown",
    category: "AI & ML", rating: 4.6, students: 1532, duration: "38 hours",
    lessons: 28, progress: 0, thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    enrolled: false, certificate: false,
  },
  {
    id: 5, title: "React Native Development", instructor: "Alex Turner",
    category: "Mobile Dev", rating: 4.8, students: 987, duration: "35 hours",
    lessons: 26, progress: 0, thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
    enrolled: false, certificate: false,
  },
  {
    id: 6, title: "Digital Marketing Mastery", instructor: "Rachel Green",
    category: "Marketing", rating: 4.5, students: 2341, duration: "24 hours",
    lessons: 20, progress: 100, thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    enrolled: true, certificate: true,
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyCourses() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "enrolled") return matchesSearch && course.enrolled;
    if (activeTab === "completed") return matchesSearch && course.progress === 100;
    if (activeTab === "inProgress") return matchesSearch && course.enrolled && course.progress > 0 && course.progress < 100;
    return matchesSearch;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage and continue your learning journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className={viewMode === "grid" ? "bg-muted" : ""} onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className={viewMode === "list" ? "bg-muted" : ""} onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search courses..." className="flex-1" />
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} viewMode={viewMode} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

function CourseCard({ course, viewMode }) {
  const content = (
    <>
      <div className="relative overflow-hidden">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {course.enrolled && course.progress > 0 && (
          <Badge className="absolute top-3 right-3 bg-blue-600 text-white border-0">{course.progress}% Complete</Badge>
        )}
        {course.certificate && course.progress === 100 && (
          <Badge className="absolute top-3 right-3 bg-emerald-600 text-white border-0">Certified</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-3">{course.category}</Badge>
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" />{course.rating}</span>
          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{course.lessons}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
        </div>
        {course.enrolled ? (
          <ProgressBar value={course.progress} size="sm" showLabel />
        ) : (
          <Button className="w-full">Enroll Now</Button>
        )}
      </CardContent>
    </>
  );

  if (viewMode === "list") {
    return (
      <motion.div variants={item}>
        <Link to={`/student/course/${course.id}`} className="block">
          <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-48 h-32 md:h-auto relative">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{course.instructor}</p>
                  </div>
                  <Badge>{course.category}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" />{course.rating}</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{course.lessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
                </div>
                {course.enrolled && <ProgressBar value={course.progress} size="sm" showLabel className="mb-3" />}
                <div className="flex items-center gap-2">
                  {course.enrolled ? (
                    <Button size="sm" className="gap-2"><Play className="h-4 w-4" />{course.progress > 0 ? "Continue" : "Start"}</Button>
                  ) : (
                    <Button size="sm">Enroll Now</Button>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={item}>
      <Link to={`/student/course/${course.id}`} className="block">
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
          {content}
        </Card>
      </Link>
    </motion.div>
  );
}