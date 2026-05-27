import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Eye, Edit, Trash2, CheckCircle2, XCircle, Star, EyeOff, ChevronLeft, ChevronRight,
  BookOpen, Users, DollarSign, AlertTriangle, Check, X, UserPlus, ShieldCheck, Loader2
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/Tabs";
import toast from "react-hot-toast";

import {
  getCourses,
  updateCourse,
  deleteCourse
} from "../../../services/courseService";
import { getTeachers, getStudents } from "../../../services/adminService";
import { assignCourseByEmail } from "../../../services/enrollmentService";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Selection states for Modals
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showEnrollStudentModal, setShowEnrollStudentModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' | 'archive' | 'delete'

  // Input states
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [coursesRes, teachersRes, studentsRes] = await Promise.all([
        getCourses(),
        getTeachers({ limit: 100 }),
        getStudents({ limit: 100 })
      ]);

      if (coursesRes.data?.success) setCourses(coursesRes.data.data);
      
      const teacherList = teachersRes.data?.data?.teachers || teachersRes.data?.teachers || [];
      setTeachers(teacherList);

      const studentList = studentsRes.data?.data?.students || studentsRes.data?.students || [];
      setStudents(studentList);
    } catch (err) {
      toast.error("Failed to load platform dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Course Approval / Publication
  const handleUpdateStatus = async (courseId, status) => {
    try {
      const res = await updateCourse(courseId, { status });
      if (res.data?.success) {
        toast.success(`Course successfully marked as ${status}`);
        loadAllData();
      }
    } catch (err) {
      toast.error("Failed to update course status");
    }
  };

  // Handle Course Deletion
  const handleDeleteCourse = async (courseId) => {
    try {
      const res = await deleteCourse(courseId);
      if (res.data?.success) {
        toast.success("Course permanently deleted");
        loadAllData();
      }
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  // Handle Assigning Teacher to Course
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return toast.error("Please select a teacher");

    try {
      const res = await updateCourse(selectedCourse._id, { teacherId: selectedTeacherId });
      if (res.data?.success) {
        toast.success("Teacher successfully assigned to course");
        setShowAssignTeacherModal(false);
        setSelectedTeacherId("");
        loadAllData();
      }
    } catch (err) {
      toast.error("Failed to assign teacher");
    }
  };

  // Handle Manual Student Enrollment
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!studentEmail) return toast.error("Please enter a student email");

    try {
      const res = await assignCourseByEmail(studentEmail, selectedCourse._id);
      if (res.data?.success) {
        toast.success("Student successfully enrolled in this course");
        setShowEnrollStudentModal(false);
        setStudentEmail("");
        loadAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to enroll student");
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "published") return matchesSearch && c.status === "published";
    if (activeTab === "draft") return matchesSearch && c.status === "draft";
    return matchesSearch;
  });

  // Calculate platform aggregate stats
  const totalCourses = courses.length;
  const publishedCount = courses.filter(c => c.status === "published").length;
  const draftCount = courses.filter(c => c.status === "draft").length;
  const totalEnrollments = courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">LMS Course Control Hub</h1>
          <p className="text-muted-foreground">Moderate courses, assign teachers, and grant student enrollment access.</p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: totalCourses, color: "blue", bg: "bg-blue-500/10", text: "text-blue-500" },
          { label: "Published", value: publishedCount, color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-500" },
          { label: "Draft/Pending", value: draftCount, color: "amber", bg: "bg-amber-500/10", text: "text-amber-500" },
          { label: "Total Enrolled", value: totalEnrollments, color: "purple", bg: "bg-purple-500/10", text: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="border border-base-300">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}><BookOpen className="h-6 w-6" /></div>
              <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filter and Search */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 border-base-300" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2 border-base-300"><Filter className="h-4 w-4" />Filters</Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({totalCourses})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
            <TabsTrigger value="draft">Pending ({draftCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Courses List Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="p-12 text-center border bg-base-100/50">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
          <p className="text-muted-foreground">There are no courses on the platform matching this selection.</p>
        </Card>
      ) : (
        <motion.div variants={item}>
          <Card className="border border-base-300 bg-base-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-base-200/50">
                    <th className="px-4 py-3.5 text-sm font-semibold text-muted-foreground">Course Details</th>
                    <th className="px-4 py-3.5 text-sm font-semibold text-muted-foreground">Category</th>
                    <th className="px-4 py-3.5 text-sm font-semibold text-muted-foreground">Instructor</th>
                    <th className="px-4 py-3.5 text-sm font-semibold text-muted-foreground">Price</th>
                    <th className="px-4 py-3.5 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3.5 text-sm font-semibold text-muted-foreground text-center">Manage Access</th>
                    <th className="px-4 py-3.5 text-sm font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80"} alt={course.title} className="w-12 h-12 rounded-lg object-cover bg-base-300" />
                          <div>
                            <p className="font-semibold text-base line-clamp-1">{course.title}</p>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                              <Users className="h-3 w-3" /> {course.students?.length || 0} enrolled
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="secondary" className="capitalize">{course.category || "General"}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6" fallback={course.teacherId?.name?.charAt(0) || "T"} />
                          <span className="text-sm font-medium">{course.teacherId?.name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-success">${course.price}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={course.status === "published" ? "success" : "warning"} className="capitalize">
                          {course.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-center gap-2">
                          <Button size="xs" variant="outline" className="gap-1 border-base-300" onClick={() => {
                            setSelectedCourse(course);
                            setShowAssignTeacherModal(true);
                          }}><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Instructor</Button>
                          <Button size="xs" variant="outline" className="gap-1 border-base-300" onClick={() => {
                            setSelectedCourse(course);
                            setShowEnrollStudentModal(true);
                          }}><UserPlus className="h-3.5 w-3.5 text-success" /> Student</Button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          {course.status === "draft" ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => handleUpdateStatus(course._id, "published")}>
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-warning hover:bg-warning/10" onClick={() => handleUpdateStatus(course._id, "draft")}>
                              <EyeOff className="h-4.5 w-4.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-error hover:bg-error/10" onClick={() => {
                            setSelectedCourse(course);
                            setActionType("delete");
                            setShowActionModal(true);
                          }}><Trash2 className="h-4.5 w-4.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ASSIGN TEACHER MODAL */}
      <Modal isOpen={showAssignTeacherModal} onClose={() => setShowAssignTeacherModal(false)} title="Assign Course Instructor">
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <p className="text-sm text-muted-foreground">Select an instructor for course: <strong>{selectedCourse?.title}</strong></p>
          <div>
            <label className="text-sm font-semibold mb-1 block text-foreground/80">Select Teacher</label>
            <select className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm" value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
              <option value="">-- Choose Instructor --</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAssignTeacherModal(false)}>Cancel</Button>
            <Button type="submit">Assign Instructor</Button>
          </div>
        </form>
      </Modal>

      {/* MANUALLY ENROLL STUDENT MODAL */}
      <Modal isOpen={showEnrollStudentModal} onClose={() => setShowEnrollStudentModal(false)} title="Grant Student Enrollment Access">
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <p className="text-sm text-muted-foreground">Grant student access to course: <strong>{selectedCourse?.title}</strong></p>
          <Input label="Student Email Address *" placeholder="e.g. learner@example.com" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowEnrollStudentModal(false)}>Cancel</Button>
            <Button type="submit">Grant Access (Enroll)</Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title="Delete Course">
        {selectedCourse && (
          <div className="space-y-4">
            <div className="flex gap-3 p-4 rounded-lg bg-error/10 border border-error/20">
              <AlertTriangle className="h-6 w-6 text-error shrink-0" />
              <div>
                <p className="text-sm font-bold text-error">Warning: Critical Cascade Deletion</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deleting "<strong>{selectedCourse.title}</strong>" will permanently erase all nested Modules, Topic lectures, and Student enrollment records from the database.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                handleDeleteCourse(selectedCourse._id);
                setShowActionModal(false);
              }}>Confirm Permanent Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}