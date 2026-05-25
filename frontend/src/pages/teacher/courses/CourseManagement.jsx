import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreVertical, Edit, Trash2, Users, Play, Clock,
  BookOpen, Eye, Loader2, ArrowLeft, FolderPlus, FilePlus, ExternalLink, ShieldAlert
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";
import toast from "react-hot-toast";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../../../services/courseService";
import { createModule, deleteModule } from "../../../services/moduleService";
import { createTopic, deleteTopic } from "../../../services/topicService";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Mode state: 'list' or 'curriculum'
  const [currentMode, setCurrentMode] = useState("list");
  const [activeCourse, setActiveCourse] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);

  // Course Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");

  // Module Form States
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState("");

  // Topic Form States
  const [topicTitle, setTopicTitle] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [topicVideoUrl, setTopicVideoUrl] = useState("");
  const [topicDuration, setTopicDuration] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const res = await getCourses();
      if (res.data?.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Refetch individual active course inside curriculum builder
  async function refreshActiveCourse(courseId) {
    try {
      const res = await getCourses();
      if (res.data?.success) {
        const updatedCourses = res.data.data;
        setCourses(updatedCourses);
        const match = updatedCourses.find(c => c._id === courseId);
        if (match) setActiveCourse(match);
      }
    } catch (err) {
      console.error("Failed to refresh active course:", err);
    }
  }

  // Handle Course Creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title) return toast.error("Course title is required");

    try {
      const data = {
        title, description, category,
        price: Number(price) || 0,
        thumbnail, difficulty, duration, status,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
      };

      const res = await createCourse(data);
      if (res.data?.success) {
        toast.success("Course created successfully!");
        setShowCreateModal(false);
        // Reset form
        setTitle(""); setDescription(""); setCategory(""); setPrice(""); setThumbnail(""); setTags(""); setDuration("");
        loadCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    }
  };

  // Handle Course Update (e.g. toggling status draft/published)
  const handleUpdateCourseStatus = async (course, newStatus) => {
    try {
      const res = await updateCourse(course._id, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Course updated to ${newStatus}`);
        loadCourses();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Handle Course Deletion
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? All modules, topics, and enrollments will be permanently erased.")) return;

    try {
      const res = await deleteCourse(courseId);
      if (res.data?.success) {
        toast.success("Course deleted successfully!");
        loadCourses();
      }
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  // Handle Module Creation
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle) return toast.error("Module title is required");

    try {
      const res = await createModule({
        title: moduleTitle,
        order: Number(moduleOrder) || 0,
        courseId: activeCourse._id,
      });

      if (res.data?.success) {
        toast.success("Module added successfully!");
        setShowAddModuleModal(false);
        setModuleTitle("");
        setModuleOrder("");
        refreshActiveCourse(activeCourse._id);
      }
    } catch (err) {
      toast.error("Failed to create module");
    }
  };

  // Handle Module Deletion
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Delete this module? All child topics will be deleted.")) return;

    try {
      const res = await deleteModule(moduleId);
      if (res.data?.success) {
        toast.success("Module deleted successfully!");
        refreshActiveCourse(activeCourse._id);
      }
    } catch (err) {
      toast.error("Failed to delete module");
    }
  };

  // Handle Topic Creation
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicTitle) return toast.error("Topic title is required");

    try {
      const res = await createTopic({
        title: topicTitle,
        content: topicContent,
        videoUrl: topicVideoUrl,
        duration: Number(topicDuration) || 0,
        moduleId: selectedModuleId,
      });

      if (res.data?.success) {
        toast.success("Topic added successfully!");
        setShowAddTopicModal(false);
        setTopicTitle("");
        setTopicContent("");
        setTopicVideoUrl("");
        setTopicDuration("");
        refreshActiveCourse(activeCourse._id);
      }
    } catch (err) {
      toast.error("Failed to add topic");
    }
  };

  // Handle Topic Deletion
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("Delete this topic?")) return;

    try {
      const res = await deleteTopic(topicId);
      if (res.data?.success) {
        toast.success("Topic deleted!");
        refreshActiveCourse(activeCourse._id);
      }
    } catch (err) {
      toast.error("Failed to delete topic");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {currentMode === "list" ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Header */}
          <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Course Management</h1>
              <p className="text-muted-foreground">Create and manage your course curriculum</p>
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
              placeholder="Search your courses..."
              className="max-w-md"
            />
          </motion.div>

          {/* Courses Listing */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="p-12 text-center border bg-base-100/50">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
              <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-6">Create a course to start building modules and uploading lectures.</p>
              <Button onClick={() => setShowCreateModal(true)}>Create First Course</Button>
            </Card>
          ) : (
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEdit={() => {
                    setActiveCourse(course);
                    setCurrentMode("curriculum");
                  }}
                  onDelete={() => handleDeleteCourse(course._id)}
                  onStatusChange={(newStatus) => handleUpdateCourseStatus(course, newStatus)}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Curriculum Builder Mode */
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => { setCurrentMode("list"); setActiveCourse(null); }} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">Curriculum Editor</span>
                <h1 className="text-2xl font-bold truncate max-w-lg">{activeCourse?.title}</h1>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddModuleModal(true)}>
                <FolderPlus className="h-4 w-4" /> Add Module
              </Button>
              <Button size="sm" className="gap-2" onClick={() => {
                if (activeCourse.modules?.length === 0) {
                  return toast.error("Create at least one module first!");
                }
                setSelectedModuleId(activeCourse.modules[0]._id);
                setShowAddTopicModal(true);
              }}>
                <FilePlus className="h-4 w-4" /> Add Topic
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Summary Info */}
            <div className="space-y-4">
              <Card className="border bg-base-100/50 shadow-md">
                <div className="relative h-44">
                  <img src={activeCourse?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"} alt="Thumbnail" className="w-full h-full object-cover rounded-t-2xl" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={activeCourse?.status === "published" ? "success" : "warning"}>{activeCourse?.status}</Badge>
                  </div>
                </div>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-bold text-lg">Course Specs</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Category</span><span className="font-medium text-foreground">{activeCourse?.category || "General"}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Difficulty</span><span className="font-medium text-foreground capitalize">{activeCourse?.difficulty}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Total Modules</span><span className="font-medium text-foreground">{activeCourse?.modules?.length || 0}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Price</span><span className="font-medium text-success">${activeCourse?.price}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Modules & Topics Accordion */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-xl flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Curriculum Modules</h2>
              {activeCourse?.modules?.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-2xl bg-base-100/30">
                  <FolderPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                  <p className="font-semibold text-muted-foreground">No modules added yet.</p>
                  <p className="text-sm text-muted-foreground/80 mb-4">Modules divide your course into sections, like chapters.</p>
                  <Button size="sm" onClick={() => setShowAddModuleModal(true)}>Add First Module</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCourse.modules.map((mod) => (
                    <div key={mod._id} className="border border-base-300 rounded-2xl overflow-hidden bg-base-100 shadow-sm">
                      <div className="flex items-center justify-between p-4 bg-base-200/50 border-b">
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Module #{mod.order || 0}</span>
                          <h3 className="font-bold text-lg">{mod.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="xs" variant="outline" className="gap-1" onClick={() => {
                            setSelectedModuleId(mod._id);
                            setShowAddTopicModal(true);
                          }}><FilePlus className="h-3 w-3" /> Add Topic</Button>
                          <Button size="xs" variant="destructive" onClick={() => handleDeleteModule(mod._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-base-200">
                        {mod.topics?.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No topics/lectures in this module yet.
                          </div>
                        ) : (
                          mod.topics.map((topic) => (
                            <div key={topic._id} className="flex items-center justify-between p-4 hover:bg-base-200/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary"><Play className="h-4 w-4 fill-current" /></div>
                                <div>
                                  <h4 className="font-medium text-sm">{topic.title}</h4>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {topic.duration} mins</span>
                                    {topic.videoUrl && <span className="flex items-center gap-0.5 text-blue-500 font-semibold"><ExternalLink className="h-3 w-3" /> Video</span>}
                                  </div>
                                </div>
                              </div>
                              <Button size="xs" variant="ghost" className="text-error hover:bg-error/10" onClick={() => handleDeleteTopic(topic._id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* CREATE COURSE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Course" size="2xl">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input label="Course Title *" placeholder="e.g. JavaScript Deep Dive" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" placeholder="e.g. Programming" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input label="Price ($)" type="number" placeholder="99" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block text-foreground/80">Description</label>
            <textarea
              className="textarea textarea-bordered border-base-300 w-full h-24 rounded-xl px-3 py-2 bg-card text-sm focus:ring-1 focus:ring-primary outline-none"
              placeholder="Describe what students will learn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Thumbnail URL" placeholder="https://unsplash..." value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
            <Input label="Duration (e.g. 35 hours)" placeholder="e.g. 35 hours" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1 block text-foreground/80">Difficulty Level</label>
              <select className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Input label="Tags (comma-separated)" placeholder="js, async, dev" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit">Create Course</Button>
          </div>
        </form>
      </Modal>

      {/* CREATE MODULE MODAL */}
      <Modal isOpen={showAddModuleModal} onClose={() => setShowAddModuleModal(false)} title="Add Curriculum Module">
        <form onSubmit={handleCreateModule} className="space-y-4">
          <Input label="Module Title *" placeholder="e.g. Introduction & Setup" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} required />
          <Input label="Sorting Order Number" type="number" placeholder="e.g. 1" value={moduleOrder} onChange={(e) => setModuleOrder(e.target.value)} />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAddModuleModal(false)}>Cancel</Button>
            <Button type="submit">Add Module</Button>
          </div>
        </form>
      </Modal>

      {/* CREATE TOPIC MODAL */}
      <Modal isOpen={showAddTopicModal} onClose={() => setShowAddTopicModal(false)} title="Add Topic / Lecture" size="2xl">
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1 block text-foreground/80">Select Module</label>
              <select className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm" value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}>
                {activeCourse?.modules?.map(m => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>
            <Input label="Topic Title *" placeholder="e.g. Currying and Composition" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lecture Video URL" placeholder="e.g. https://www.youtube.com/embed/..." value={topicVideoUrl} onChange={(e) => setTopicVideoUrl(e.target.value)} />
            <Input label="Duration (minutes) *" type="number" placeholder="e.g. 15" value={topicDuration} onChange={(e) => setTopicDuration(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block text-foreground/80">Markdown Lecture Notes / Content</label>
            <textarea
              className="textarea textarea-bordered border-base-300 w-full h-32 rounded-xl px-3 py-2 bg-card text-sm focus:ring-1 focus:ring-primary outline-none font-mono"
              placeholder="### Lecture Notes ... Write code blocks, key take-aways, markdown notes here..."
              value={topicContent}
              onChange={(e) => setTopicContent(e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAddTopicModal(false)}>Cancel</Button>
            <Button type="submit">Add Lecture</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CourseCard({ course, onEdit, onDelete, onStatusChange }) {
  const modulesCount = course.modules?.length || 0;
  const topicsCount = course.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0;
  const studentsCount = course.students?.length || 0;

  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-base-300 bg-base-100">
        <div className="relative h-48 overflow-hidden bg-base-300">
          <img
            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge
            className={`absolute top-3 right-3 border-0 text-white capitalize ${
              course.status === "published" ? "bg-success" : "bg-warning"
            }`}
          >
            {course.status}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant="secondary" className="mb-1 capitalize">{course.category || "General"}</Badge>
            <h3 className="text-xl font-bold text-white truncate">{course.title}</h3>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-2 text-center text-sm text-muted-foreground mb-5 pb-3 border-b border-base-200">
            <div className="flex flex-col"><span className="font-bold text-foreground">{studentsCount}</span><span>Students</span></div>
            <div className="flex flex-col border-x border-base-200"><span className="font-bold text-foreground">{modulesCount}</span><span>Modules</span></div>
            <div className="flex flex-col"><span className="font-bold text-foreground">{topicsCount}</span><span>Topics</span></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-success">${course.price}</span>
              <span className="text-xs text-muted-foreground capitalize">({course.difficulty})</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={onEdit}>
                <Edit className="h-3.5 w-3.5" /> Edit Curriculum
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-base-300">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-base-100 border border-base-300 rounded-2xl shadow-xl">
                  {course.status === "draft" ? (
                    <DropdownMenuItem onClick={() => onStatusChange("published")} className="text-success font-semibold">
                      <Play className="h-4 w-4 mr-2" /> Publish Course
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onStatusChange("draft")} className="text-warning font-semibold">
                      <ShieldAlert className="h-4 w-4 mr-2" /> Unpublish (Draft)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive font-semibold" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}