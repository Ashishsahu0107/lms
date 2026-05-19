import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Play,
  Clock,
  BarChart3,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SearchBar } from "../../components/ui/SearchBar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";

const courses = [
  {
    id: 1,
    title: "Advanced JavaScript",
    category: "Programming",
    students: 124,
    lessons: 24,
    duration: "32 hours",
    progress: 78,
    status: "published",
    rating: 4.8,
    price: 99,
    thumbnail: "https://images.unsplash.com/photo-1627392662291-4c2ac9c424e9?w=400",
    lastUpdated: "2024-01-10",
  },
  {
    id: 2,
    title: "React Development Masterclass",
    category: "Frontend",
    students: 156,
    lessons: 32,
    duration: "40 hours",
    progress: 45,
    status: "published",
    rating: 4.9,
    price: 129,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f1349aef6736?w=400",
    lastUpdated: "2024-01-08",
  },
  {
    id: 3,
    title: "Python for Data Science",
    category: "Data Science",
    students: 98,
    lessons: 28,
    duration: "38 hours",
    progress: 20,
    status: "draft",
    rating: 4.7,
    price: 119,
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0c9359?w=400",
    lastUpdated: "2024-01-05",
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    category: "Design",
    students: 67,
    lessons: 18,
    duration: "24 hours",
    progress: 92,
    status: "published",
    rating: 4.6,
    price: 89,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
    lastUpdated: "2024-01-03",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CourseManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">
            Create and manage your courses
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses..."
          className="max-w-md"
        />
      </motion.div>

      {/* Courses Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => setSelectedCourse(course)}
          />
        ))}
      </motion.div>

      {/* Create Course Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Course"
        size="2xl"
      >
        <div className="space-y-4">
          <Input label="Course Title" placeholder="Enter course title" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" placeholder="e.g., Programming" />
            <Input label="Price ($)" type="number" placeholder="99" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm"
              placeholder="Describe what students will learn..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Lessons" type="number" placeholder="24" />
            <Input label="Duration (hours)" type="number" placeholder="32" />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button>Create Course</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

function CourseCard({ course, onEdit }) {
  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge
            className={`absolute top-3 right-3 ${
              course.status === "published"
                ? "bg-emerald-600 text-white border-0"
                : "bg-amber-600 text-white border-0"
            }`}
          >
            {course.status}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-semibold text-white truncate">{course.title}</h3>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.students} students
            </span>
            <span className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              {course.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{course.category}</Badge>
              <span className="text-sm font-medium text-emerald-600">
                ${course.price}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}