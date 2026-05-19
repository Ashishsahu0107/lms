import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, Eye, Edit, Trash2, CheckCircle2, XCircle, Star, EyeOff, ChevronLeft, ChevronRight,
  BookOpen, Users, DollarSign, AlertTriangle, Check, X, Image as ImageIcon
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";

const mockCourses = [
  { _id: "1", title: "Advanced JavaScript", teacherId: { name: "Dr. James Wilson", avatar: "" }, category: "Programming", price: 99.99, thumbnail: "https://images.unsplash.com/photo-1627392662291-4c2ac9c424e9?w=400", status: "published", students: [], ratings: 4.8, difficulty: "intermediate", createdAt: new Date("2024-01-15") },
  { _id: "2", title: "Python for Data Science", teacherId: { name: "Prof. Emily Chen", avatar: "" }, category: "Data Science", price: 149.99, thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0c9359?w=400", status: "published", students: [], ratings: 4.9, difficulty: "advanced", createdAt: new Date("2024-02-20") },
  { _id: "3", title: "UI/UX Design Fundamentals", teacherId: { name: "Sarah Johnson", avatar: "" }, category: "Design", price: 79.99, thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400", status: "draft", students: [], ratings: 0, difficulty: "beginner", createdAt: new Date("2024-03-10") },
  { _id: "4", title: "Machine Learning Basics", teacherId: { name: "Dr. Michael Brown", avatar: "" }, category: "AI & ML", price: 199.99, thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400", status: "draft", students: [], ratings: 0, difficulty: "intermediate", createdAt: new Date("2024-04-05") },
  { _id: "5", title: "React Native Development", teacherId: { name: "Alex Turner", avatar: "" }, category: "Mobile Dev", price: 129.99, thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400", status: "published", students: [], ratings: 4.7, difficulty: "intermediate", createdAt: new Date("2024-05-12") },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const filteredCourses = mockCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "published") return matchesSearch && c.status === "published";
    if (activeTab === "draft") return matchesSearch && c.status === "draft";
    return matchesSearch;
  });

  const handleAction = (course, action) => {
    setSelectedCourse(course);
    setActionType(action);
    setShowActionModal(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Moderate and manage all courses on the platform</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: mockCourses.length, color: "blue" },
          { label: "Published", value: mockCourses.filter(c => c.status === "published").length, color: "emerald" },
          { label: "Pending Review", value: mockCourses.filter(c => c.status === "draft").length, color: "amber" },
          { label: "Total Enrollments", value: mockCourses.reduce((a, c) => a + (c.students?.length || 0), 0), color: "purple" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}><BookOpen className={`h-6 w-6 text-${stat.color}-600`} /></div>
              <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({mockCourses.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({mockCourses.filter(c => c.status === "published").length})</TabsTrigger>
            <TabsTrigger value="draft">Pending Review ({mockCourses.filter(c => c.status === "draft").length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Course</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Teacher</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-amber-500" />
                            {course.ratings > 0 ? course.ratings : "No ratings"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{course.category}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6" fallback={course.teacherId.name.charAt(0)} />
                        <span className="text-sm">{course.teacherId.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-medium">${course.price}</span></td>
                    <td className="px-4 py-3">
                      <Badge variant={course.status === "published" ? "success" : "warning"}>
                        {course.status === "published" ? "Published" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedCourse(course)}><Eye className="h-4 w-4" /></Button>
                        {course.status === "draft" ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleAction(course, "approve")}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction(course, "reject")}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction(course, "archive")}>
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction(course, "delete")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">Showing {filteredCourses.length} courses</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Course Detail Modal */}
      <Modal isOpen={!!selectedCourse && !showActionModal} onClose={() => setSelectedCourse(null)} title="Course Details" size="lg">
        {selectedCourse && (
          <div className="space-y-4">
            <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-40 object-cover rounded-xl" />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedCourse.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedCourse.category} • {selectedCourse.difficulty}</p>
              </div>
              <Badge variant={selectedCourse.status === "published" ? "success" : "warning"}>
                {selectedCourse.status === "published" ? "Published" : "Pending"}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center"><p className="text-2xl font-bold">{selectedCourse.students?.length || 0}</p><p className="text-xs text-muted-foreground">Students</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{selectedCourse.ratings}</p><p className="text-xs text-muted-foreground">Rating</p></div>
              <div className="text-center"><p className="text-2xl font-bold">${selectedCourse.price}</p><p className="text-xs text-muted-foreground">Price</p></div>
              <div className="text-center"><p className="text-2xl font-bold">${((selectedCourse.price || 0) * (selectedCourse.students?.length || 0)).toLocaleString()}</p><p className="text-xs text-muted-foreground">Revenue</p></div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1 gap-2"><Edit className="h-4 w-4" />Edit Course</Button>
              <Button variant="outline" className="flex-1 gap-2"><Eye className="h-4 w-4" />Preview</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title="">
        {selectedCourse && (
          <div className="space-y-4">
            {actionType === "approve" && (
              <div className="flex gap-3 p-4 rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <p className="text-sm">Approve "<strong>{selectedCourse.title}</strong>" for publication?</p>
              </div>
            )}
            {actionType === "reject" && (
              <div className="flex gap-3 p-4 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
                <p className="text-sm">Reject "<strong>{selectedCourse.title}</strong>"? The teacher will be notified.</p>
              </div>
            )}
            {actionType === "delete" && (
              <div className="flex gap-3 p-4 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
                <p className="text-sm">Permanently delete "<strong>{selectedCourse.title}</strong>"?</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
              <Button variant={actionType === "delete" || actionType === "reject" ? "destructive" : "default"} onClick={() => setShowActionModal(false)}>
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}