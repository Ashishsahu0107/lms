import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckSquare,
  Award,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import toast from "react-hot-toast";

import { getCourseById } from "../../services/courseService";
import {
  getStudentEnrollments,
  markTopicProgress,
} from "../../services/enrollmentService";
import { useAuth } from "../../context/AuthContext";

export default function CourseDetails() {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTopic, setActiveTopic] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [progress, setProgress] = useState(0);

  // Accordion state (expanded modules)
  const [expandedModules, setExpandedModules] = useState({});

  async function loadCourseDetails() {
    try {
      setLoading(true);
      const [courseRes, enrollRes] = await Promise.all([
        getCourseById(courseId),
        getStudentEnrollments(user.id),
      ]);

      if (courseRes.data?.success) {
        const courseData = courseRes.data.data;
        setCourse(courseData);

        // Auto-expand all modules initially
        const expanded = {};
        courseData.modules?.forEach((mod) => {
          expanded[mod._id] = true;
        });
        setExpandedModules(expanded);

        // Find first topic of first module to set active initially
        const firstModule = courseData.modules?.[0];
        const firstTopic = firstModule?.topics?.[0];
        if (firstTopic) setActiveTopic(firstTopic);
      }

      if (enrollRes.data?.success) {
        const studentEnrollments = enrollRes.data.data;
        const match = studentEnrollments.find(
          (e) => e.courseId?._id === courseId,
        );
        if (match) {
          setEnrollment(match);
          setCompletedTopics(match.completedTopics || []);
          setProgress(match.progress || 0);
        }
      }
    } catch (err) {
      toast.error("Failed to load course details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourseDetails();
  }, [courseId, user]);

  // Toggle Module Accordion
  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Toggle topic progress complete/incomplete
  const handleToggleComplete = async (topicId) => {
    const isCompleted = completedTopics.includes(topicId);

    try {
      const res = await markTopicProgress(courseId, topicId, !isCompleted);
      if (res.data?.success) {
        const updatedProgress = res.data.data.progress;
        const updatedCompleted = res.data.data.completedTopics;

        setProgress(updatedProgress);
        setCompletedTopics(updatedCompleted);

        if (!isCompleted) {
          toast.success("Topic marked as complete!");
        } else {
          toast.success("Topic marked as incomplete");
        }
      }
    } catch (err) {
      toast.error("Failed to update progress");
    }
  };

  // Flatten all topics across all modules in order for navigation
  const flatTopics =
    course?.modules?.reduce((acc, mod) => {
      if (mod.topics) {
        return [...acc, ...mod.topics];
      }
      return acc;
    }, []) || [];

  const activeIndex = flatTopics.findIndex((t) => t._id === activeTopic?._id);

  // Navigate to Next Topic
  const handleNextTopic = () => {
    if (activeIndex < flatTopics.length - 1) {
      setActiveTopic(flatTopics[activeIndex + 1]);
    }
  };

  // Navigate to Previous Topic
  const handlePrevTopic = () => {
    if (activeIndex > 0) {
      setActiveTopic(flatTopics[activeIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="p-12 text-center border max-w-md mx-auto mt-12 bg-base-100">
        <h3 className="text-xl font-bold mb-2">Course not found</h3>
        <p className="text-muted-foreground mb-4">
          The course you are trying to access does not exist or you lack
          permission.
        </p>
        <Button onClick={() => navigate("/student/courses")}>
          Back to My Courses
        </Button>
      </Card>
    );
  }

  const isTopicCompleted = completedTopics.includes(activeTopic?._id);

  return (
    <div className="min-h-[85vh] bg-base-200 -m-4 lg:-m-8 flex flex-col lg:flex-row border-t border-base-300">
      {/* ======================================================== */}
      {/* LEFT SIDEBAR: COLLAPSIBLE MODULES ACCORDION */}
      {/* ======================================================== */}
      <aside className="w-full lg:w-80 bg-base-100 border-r border-base-300 flex flex-col shrink-0">
        {/* Course Progress header */}
        <div className="p-5 border-b border-base-300 space-y-3 bg-base-200/50">
          <h2 className="font-extrabold text-lg line-clamp-1">
            {course.title}
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            Instructor: {course.teacherId?.name}
          </span>
          <ProgressBar value={progress} size="sm" showLabel />
        </div>

        {/* Modules Accordion list */}
        <div className="flex-1 overflow-y-auto divide-y divide-base-300">
          {course.modules?.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">
              No modules are currently added to this course curriculum.
            </div>
          ) : (
            course.modules.map((mod) => {
              const isExpanded = !!expandedModules[mod._id];
              return (
                <div key={mod._id} className="flex flex-col">
                  {/* Module Accordion Trigger */}
                  <button
                    onClick={() => toggleModule(mod._id)}
                    className="flex items-center justify-between p-4 hover:bg-base-200/50 transition-colors w-full text-left bg-base-100 font-bold"
                  >
                    <div className="max-w-[80%]">
                      <span className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold">
                        Module #{mod.order || 0}
                      </span>
                      <span className="text-sm line-clamp-1">{mod.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4.5 w-4.5 opacity-60" />
                    ) : (
                      <ChevronRight className="h-4.5 w-4.5 opacity-60" />
                    )}
                  </button>

                  {/* Nested Topics list inside Module */}
                  {isExpanded && (
                    <div className="bg-base-200/20 divide-y divide-base-200">
                      {mod.topics?.length === 0 ? (
                        <div className="p-3.5 text-center text-xs text-muted-foreground/60 italic">
                          No lectures inside module
                        </div>
                      ) : (
                        mod.topics.map((topic) => {
                          const isActive = activeTopic?._id === topic._id;
                          const isCompleted = completedTopics.includes(
                            topic._id,
                          );

                          return (
                            <button
                              key={topic._id}
                              onClick={() => setActiveTopic(topic)}
                              className={`flex items-center gap-3 p-4 w-full text-left transition-colors text-xs font-semibold ${
                                isActive
                                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                                  : "hover:bg-base-200/50"
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-full shrink-0 ${isCompleted ? "bg-success/15 text-success" : "bg-base-300 text-muted-foreground"}`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <span className="flex-1 line-clamp-2">
                                {topic.title}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* RIGHT MAIN PANEL: TOPIC CONTENT VIEWER */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col bg-base-200 min-w-0">
        {activeTopic ? (
          <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
            {/* Topic Header banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-5">
              <div>
                <Badge
                  variant="primary"
                  className="capitalize text-[10px] tracking-widest font-bold mb-1"
                >
                  {course.category || "Curriculum"}
                </Badge>
                <h1 className="text-2xl font-extrabold">{activeTopic.title}</h1>
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-1">
                  <Clock className="h-3.5 w-3.5" /> Duration:{" "}
                  {activeTopic.duration || 0} minutes
                </span>
              </div>
              <Button
                variant={isTopicCompleted ? "success" : "outline"}
                className="gap-2 shrink-0 border-base-300 font-semibold"
                onClick={() => handleToggleComplete(activeTopic._id)}
              >
                <CheckSquare className="h-4.5 w-4.5 fill-current" />
                {isTopicCompleted ? "Completed" : "Mark Complete"}
              </Button>
            </div>

            {/* Embedded Video Player */}
            {activeTopic.videoUrl ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border border-base-300 bg-black">
                {activeTopic.videoUrl.includes("youtube.com") ||
                activeTopic.videoUrl.includes("youtu.be") ||
                activeTopic.videoUrl.includes("embed") ? (
                  <iframe
                    className="w-full h-full"
                    src={activeTopic.videoUrl}
                    title={activeTopic.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="w-full h-full object-contain"
                    controls
                    src={activeTopic.videoUrl}
                  />
                )}
              </div>
            ) : (
              <Card className="border border-base-300 bg-base-100/50 shadow-md">
                <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center">
                  <Sparkles className="h-12 w-12 text-primary/50 mb-3" />
                  <p className="font-bold text-foreground">
                    Lecture Notes & Guide
                  </p>
                  <p className="text-sm max-w-sm mt-0.5">
                    This topic focuses on reading and writing study materials.
                    See notes and resources below.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Lecture notes & details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Markdown Content */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-base-300 bg-base-100 shadow-md">
                  <div className="p-5 border-b border-base-200">
                    <h3 className="font-extrabold text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" /> Lecture
                      Notes
                    </h3>
                  </div>
                  <CardContent className="p-6 prose max-w-none text-foreground/90 whitespace-pre-line text-sm leading-relaxed">
                    {activeTopic.content ||
                      "No lecture notes uploaded for this topic. Pay close attention to the video curriculum above!"}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Download Attachments */}
              <div className="space-y-4">
                <Card className="border border-base-300 bg-base-100 shadow-md">
                  <div className="p-5 border-b border-base-200">
                    <h3 className="font-extrabold text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Downloadable
                      Resources
                    </h3>
                  </div>
                  <CardContent className="p-5">
                    {(!activeTopic.resources ||
                      activeTopic.resources.length === 0) &&
                    (!activeTopic.attachments ||
                      activeTopic.attachments.length === 0) ? (
                      <p className="text-xs text-muted-foreground/60 italic text-center py-4">
                        No attachments uploaded.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {activeTopic.resources?.map((res, index) => (
                          <a
                            key={index}
                            href={res.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 border border-base-300 rounded-xl hover:bg-base-200/50 transition-colors w-full text-left group"
                          >
                            <span className="text-xs font-bold line-clamp-1 group-hover:text-primary transition-colors">
                              {res.title || `Resource #${index + 1}`}
                            </span>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        ))}
                        {activeTopic.attachments?.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 border border-base-300 rounded-xl hover:bg-base-200/50 transition-colors w-full text-left group"
                          >
                            <span className="text-xs font-bold line-clamp-1 group-hover:text-primary transition-colors">
                              Lecture Guide #{index + 1}
                            </span>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom Navigation Toolbar */}
            <div className="flex items-center justify-between pt-6 border-t border-base-300 bg-base-200/70">
              <Button
                variant="outline"
                className="gap-2 border-base-300 font-bold"
                onClick={handlePrevTopic}
                disabled={activeIndex === 0}
              >
                <ArrowLeft className="h-4 w-4" /> Previous Topic
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-base-300 font-bold"
                onClick={handleNextTopic}
                disabled={activeIndex === flatTopics.length - 1}
              >
                Next Topic <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-center text-muted-foreground min-h-[50vh]">
            <BookOpen className="h-16 w-16 text-primary/45 mb-4" />
            <h2 className="text-xl font-bold text-foreground">
              Select a Topic
            </h2>
            <p className="max-w-xs mt-1 text-sm">
              Choose a lesson from the left sidebar syllabus to begin learning
              and tracking progress!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
