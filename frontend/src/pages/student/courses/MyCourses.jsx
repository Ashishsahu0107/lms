import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Filter, Grid, List, BookOpen, Clock, Star, Play, Award, Loader2, BookOpenCheck
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/Tabs";
import { getStudentEnrollments } from "../../../services/enrollmentService";
import { useAuth } from "../../../context/AuthContext";
import { getImageUrl, handleImageError } from "../../../utils/image";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function loadEnrollments() {
      try {
        if (user?.id) {
          const res = await getStudentEnrollments(user.id);
          if (res.data?.success) {
            setEnrollments(res.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load enrolled courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEnrollments();
  }, [user]);

  // Extract and format courses with progress
  const courses = enrollments.map((enrollment) => {
    const course = enrollment.courseId ?? {};
    return {
      id: course._id,
      title: course.title || "Untitled Course",
      instructor: course.teacherId?.name || "LMS Instructor",
      category: course.category || "General",
      price: course.price,
      difficulty: course.difficulty || "beginner",
      thumbnail: course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
      progress: enrollment.progress || 0,
      lessons: course.modules?.reduce((acc, mod) => acc + (mod.topics?.length || 0), 0) || 0,
      modulesCount: course.modules?.length || 0,
      enrolled: true,
      certificate: enrollment.progress === 100,
    };
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "enrolled") return matchesSearch;
    if (activeTab === "completed") return matchesSearch && course.progress === 100;
    if (activeTab === "inProgress") return matchesSearch && course.progress > 0 && course.progress < 100;
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
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your courses..." className="flex-1" />
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center border border-base-300 bg-base-100/50">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-xl font-bold mb-2">No Courses Enrolled</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            You are not currently enrolled in any courses. Please contact your administrator or teacher to assign you access.
          </p>
        </Card>
      ) : (
        <motion.div variants={item}>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
              <TabsTrigger value="inProgress">In Progress ({courses.filter(c => c.progress > 0 && c.progress < 100).length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({courses.filter(c => c.progress === 100).length})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No courses match your filter selection.
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  );
}

function CourseCard({ course, viewMode }) {
  const content = (
    <>
      <div className="relative h-44 overflow-hidden bg-base-300">
        <img src={getImageUrl(course.thumbnail)} onError={handleImageError} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {course.progress > 0 && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-content border-0">{course.progress}% Complete</Badge>
        )}
        {course.certificate && (
          <Badge className="absolute top-3 right-3 bg-success text-success-content border-0">Completed</Badge>
        )}
      </div>
      <CardContent className="p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary" className="capitalize">{course.category}</Badge>
            <Badge variant="outline" className="capitalize text-xs">{course.difficulty}</Badge>
          </div>
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">Instructor: {course.instructor}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.modulesCount} Modules</span>
            <span className="flex items-center gap-1"><BookOpenCheck className="h-3.5 w-3.5" />{course.lessons} Topics</span>
          </div>
        </div>
        
        <div className="space-y-4 pt-2 border-t border-base-200">
          <ProgressBar value={course.progress} size="sm" showLabel />
          <Button className="w-full gap-2" variant={course.progress === 100 ? "success" : "default"}>
            <Play className="h-4 w-4 fill-current" />
            {course.progress === 0 ? "Start Course" : course.progress === 100 ? "Review Course" : "Continue Learning"}
          </Button>
        </div>
      </CardContent>
    </>
  );

  if (viewMode === "list") {
    return (
      <motion.div variants={item}>
        <Link to={`/student/courses/${course.id}`} className="block">
          <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden bg-base-100 border border-base-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-60 h-40 md:h-auto relative bg-base-300">
                <img src={getImageUrl(course.thumbnail)} onError={handleImageError} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{course.category}</Badge>
                      <Badge variant="outline" className="capitalize text-xs">{course.difficulty}</Badge>
                    </span>
                    {course.certificate && <Badge variant="success">Completed</Badge>}
                  </div>
                  <h3 className="font-bold text-xl mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">Instructor: {course.instructor}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.modulesCount} Modules</span>
                    <span className="flex items-center gap-1"><BookOpenCheck className="h-3.5 w-3.5" />{course.lessons} Topics</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-base-200">
                  <div className="flex-1">
                    <ProgressBar value={course.progress} size="sm" showLabel />
                  </div>
                  <Button size="sm" className="gap-2" variant={course.progress === 100 ? "success" : "default"}>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {course.progress === 0 ? "Start" : course.progress === 100 ? "Review" : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={item} className="flex h-full">
      <Link to={`/student/courses/${course.id}`} className="block w-full">
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer bg-base-100 border border-base-300 h-full flex flex-col">
          {content}
        </Card>
      </Link>
    </motion.div>
  );
}