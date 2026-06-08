import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCoursePlayerDetails,
  setCurrentTopic,
  updateTopicWatchProgress,
  addBookmark,
  addDiscussionComment,
  receiveDiscussionComment,
  localProgressUpdate
} from "../../../redux/slices/playerSlice";
import { saveNote } from "../../../redux/slices/notesSlice";
import { aiChat, aiSummarize, aiGenerateNotes, generateAiQuiz } from "../../../services/aiService";
import { useSocket } from "../../../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize,
  ChevronLeft, CheckCircle2, Download, MessageSquare, Bookmark,
  BookOpen, Settings, List, X, Clock, HelpCircle, Send, Award, Flame,
  Share2, ShieldCheck, PlayCircle, Star
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import toast from "react-hot-toast";

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === null) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket } = useSocket();

  const {
    course,
    progress,
    notes,
    bookmarks,
    discussions,
    currentTopic,
    watchPosition,
    loading,
    error
  } = useSelector((state) => state.player);

  const videoRef = useRef(null);
  const progressTimerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("ai"); // ai, notes, bookmarks, discussion, resources
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // Notes state
  const [noteContent, setNoteContent] = useState("");
  const [noteTimestamped, setNoteTimestamped] = useState(true);

  // Discussion state
  const [commentContent, setCommentContent] = useState("");

  // AI Assistant state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      sender: "ai",
      content: "Hello! I am your AI study copilot. Ask me anything about the current video lecture!"
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOption, setAiOption] = useState("chat");
  const [aiSummaryText, setAiSummaryText] = useState("");
  const [aiNotesText, setAiNotesText] = useState("");
  const [aiQuizQuestions, setAiQuizQuestions] = useState([]);
  const [aiQuizAnswers, setAiQuizAnswers] = useState({});
  const [aiQuizSubmitted, setAiQuizSubmitted] = useState(false);
  const [aiExplainText, setAiExplainText] = useState("");

  // Load Course Player Details
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCoursePlayerDetails(courseId));
    }
  }, [courseId, dispatch]);

  // Handle Socket Events & Multi-device Sync
  useEffect(() => {
    if (!socket || !courseId) return;

    socket.emit("join-course", courseId);

    // Listen for discussion comments
    socket.on("discussionComment", (data) => {
      dispatch(receiveDiscussionComment(data));
    });

    // Listen for progress sync on other devices
    socket.on("progressUpdated", (data) => {
      if (data.courseId === courseId) {
        dispatch(localProgressUpdate(data));
        // If it's the current topic and we're not playing, seek to position
        if (currentTopic && data.topicId === currentTopic._id && !isPlaying && videoRef.current) {
          const diff = Math.abs(videoRef.current.currentTime - data.watchPosition);
          if (diff > 5) {
            videoRef.current.currentTime = data.watchPosition;
            setCurrentTime(data.watchPosition);
          }
        }
      }
    });

    return () => {
      socket.emit("leave-course", courseId);
      socket.off("discussionComment");
      socket.off("progressUpdated");
    };
  }, [socket, courseId, currentTopic, isPlaying, dispatch]);

  // Set initial video position when current topic changes
  useEffect(() => {
    if (videoRef.current && watchPosition !== undefined) {
      videoRef.current.currentTime = watchPosition;
      setCurrentTime(watchPosition);
      
      // Notify Sockets that lecture started
      if (socket && courseId && currentTopic) {
        socket.emit("lectureStarted", { courseId, topicId: currentTopic._id });
      }
    }
  }, [currentTopic, watchPosition, socket, courseId]);

  // Timer to push watch progress to backend every 10 seconds
  useEffect(() => {
    if (isPlaying && currentTopic && courseId) {
      progressTimerRef.current = setInterval(() => {
        if (videoRef.current) {
          const currentPos = videoRef.current.currentTime;
          const totalDur = videoRef.current.duration || duration;
          dispatch(updateTopicWatchProgress({
            courseId,
            topicId: currentTopic._id,
            watchPosition: currentPos,
            duration: totalDur,
            watchTimeDelta: 10
          }));
        }
      }, 10000);
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, currentTopic, courseId, duration, dispatch]);

  // Clean up progress timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  // Play / Pause controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Video play error:", err);
        });
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    
    // Notify Sockets
    if (socket && courseId && currentTopic) {
      socket.emit("lectureCompleted", { courseId, topicId: currentTopic._id });
    }

    // Auto play next topic
    if (autoPlay && course && course.modules) {
      const allTopics = course.modules.flatMap(m => m.topics || []);
      const currentIdx = allTopics.findIndex(t => t._id === currentTopic._id);
      if (currentIdx < allTopics.length - 1) {
        const nextTopic = allTopics[currentIdx + 1];
        dispatch(setCurrentTopic(nextTopic));
        toast.success(`Playing next lesson: ${nextTopic.title}`);
      }
    }
  };

  const seek = (delta) => {
    if (videoRef.current) {
      const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const changeVolume = (v) => {
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  const handlePiP = async () => {
    try {
      if (videoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add personal note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      const pos = noteTimestamped ? Math.round(currentTime) : 0;
      await dispatch(saveNote({
        courseId,
        topicId: currentTopic._id,
        content: noteContent.trim(),
        videoPosition: pos
      })).unwrap();

      setNoteContent("");
      toast.success("Note saved at position " + formatTime(pos));
    } catch (err) {
      toast.error("Failed to save note");
    }
  };

  // Add bookmark
  const handleAddBookmark = async () => {
    try {
      const pos = Math.round(currentTime);
      await dispatch(addBookmark({
        courseId,
        topicId: currentTopic._id,
        title: `Bookmark at ${formatTime(pos)}`,
        videoPosition: pos
      })).unwrap();

      toast.success("Bookmark added!");
    } catch (err) {
      toast.error("Failed to bookmark position");
    }
  };

  // Post discussion comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await dispatch(addDiscussionComment({
        courseId,
        content: commentContent.trim()
      })).unwrap();

      setCommentContent("");
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  // Ask AI Assistant
  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    const userMsg = { sender: "user", content: aiQuestion.trim() };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiQuestion("");
    setAiLoading(true);

    try {
      const res = await aiChat(userMsg.content, courseId, null, currentTopic?._id, "ask");
      if (res && res.success) {
        setAiMessages((prev) => [...prev, { sender: "ai", content: res.data?.reply || "I've processed your query." }]);
      } else {
        setAiMessages((prev) => [...prev, { sender: "ai", content: "Apologies, I encountered a temporary logic glitch. Let me try again." }]);
      }
    } catch (err) {
      setAiMessages((prev) => [...prev, { sender: "ai", content: "Error connecting to AI helper. Please check your network." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Summarize Lecture
  const handleSummarizeLecture = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const res = await aiSummarize(courseId, null, currentTopic?._id);
      if (res && res.success) {
        setAiSummaryText(res.data?.summary || "");
        toast.success("Summary generated successfully!");
      } else {
        toast.error("Failed to generate summary");
      }
    } catch (err) {
      toast.error("Error connecting to AI assistant");
    } finally {
      setAiLoading(false);
    }
  };

  // Explain Concept
  const handleExplainConcept = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const res = await aiChat(null, courseId, null, currentTopic?._id, "explain");
      if (res && res.success) {
        setAiExplainText(res.data?.reply || "");
        toast.success("Concept explained successfully!");
      } else {
        toast.error("Failed to explain concept");
      }
    } catch (err) {
      toast.error("Error connecting to AI assistant");
    } finally {
      setAiLoading(false);
    }
  };

  // Generate Study Notes
  const handleGenerateNotes = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const res = await aiGenerateNotes(courseId, null, currentTopic?._id);
      if (res && res.success) {
        setAiNotesText(res.data?.notes || "");
        toast.success("Study notes generated!");
      } else {
        toast.error("Failed to generate notes");
      }
    } catch (err) {
      toast.error("Error connecting to AI assistant");
    } finally {
      setAiLoading(false);
    }
  };

  // Generate Practice Quiz
  const handleGeneratePracticeQuiz = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const res = await generateAiQuiz(courseId, null, currentTopic?._id, currentTopic?.title);
      if (res && res.success) {
        setAiQuizQuestions(res.data || []);
        setAiQuizAnswers({});
        setAiQuizSubmitted(false);
        toast.success("Practice quiz generated!");
      } else {
        toast.error("Failed to generate practice quiz");
      }
    } catch (err) {
      toast.error("Error connecting to AI assistant");
    } finally {
      setAiLoading(false);
    }
  };

  // Save AI response to My Notes
  const handleSaveAiNotesToMyNotes = async (content, typeLabel) => {
    if (!content) return;
    try {
      await dispatch(saveNote({
        courseId,
        topicId: currentTopic._id,
        content: content,
        videoPosition: 0
      })).unwrap();
      toast.success(`${typeLabel} saved to My Notes!`);
    } catch (err) {
      toast.error("Failed to save to notes");
    }
  };

  const handleSeekTo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide animate-pulse">Launching Premium Netflix-style Course Player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white space-y-4 p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-bold">Failed to Launch Course Player</h2>
        <p className="text-sm text-slate-400 max-w-md">{error}</p>
        <Link to="/student/courses">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            Return to Curriculum
          </Button>
        </Link>
      </div>
    );
  }

  const allTopics = course?.modules?.flatMap((m) => m.topics || []) || [];
  const activeIndex = allTopics.findIndex(t => t._id === currentTopic?._id);
  const prevTopic = activeIndex > 0 ? allTopics[activeIndex - 1] : null;
  const nextTopic = activeIndex < allTopics.length - 1 ? allTopics[activeIndex + 1] : null;

  return (
    <div className="fixed inset-0 bg-[#070b13] flex flex-col z-50 text-white font-sans overflow-hidden">
      {/* Top Header Controls */}
      <div className="h-16 bg-slate-950/80 border-b border-white/5 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link to={`/student/course/${courseId}`} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-semibold transition-colors">
            <ChevronLeft className="h-4.5 w-4.5" /> Back
          </Link>
          <span className="text-white/10">|</span>
          <span className="text-sm font-black text-white/90 truncate max-w-sm">{course?.title}</span>
          {currentTopic && (
            <>
              <span className="text-white/10">/</span>
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 truncate max-w-xs">{currentTopic.title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mr-4 text-xs font-bold text-slate-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span>Online counts synced</span>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Video Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          {/* Main customized Video player */}
          <div className="relative bg-black flex-1 flex items-center justify-center group overflow-hidden">
            <video
              ref={videoRef}
              src={currentTopic?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
              className="w-full h-full object-contain"
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              onEnded={handleEnded}
              onClick={togglePlay}
            />

            {/* Video center Play overlay */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none cursor-pointer"
                >
                  <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/20">
                    <Play className="h-7 w-7 fill-current ml-1" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Control Bar overlays */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 space-y-4">
              {/* Progress Seekbar */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400 font-bold">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const seekVal = parseFloat(e.target.value);
                    if (videoRef.current) videoRef.current.currentTime = seekVal;
                    setCurrentTime(seekVal);
                  }}
                  className="w-full h-1 accent-indigo-500 rounded bg-slate-700/80 cursor-pointer focus:outline-none"
                />
                <span className="text-[10px] font-mono text-slate-400 font-bold">{formatTime(duration)}</span>
              </div>

              {/* Bottom buttons panel */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={() => seek(-10)}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white h-10 w-10 bg-white/5 border border-white/5 rounded-full" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5 fill-current" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={() => seek(10)}>
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  {/* Volume controls */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={toggleMute}>
                      {muted || volume === 0 ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={muted ? 0 : volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-20 accent-indigo-500 h-1 bg-slate-700 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Autoplay toggler */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      className="accent-indigo-500 w-3.5 h-3.5"
                    />
                    Autoplay Next
                  </label>

                  <span className="text-white/20">|</span>

                  {/* Playback speed selector */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white text-xs font-black"
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    >
                      {playbackRate}x
                    </Button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 min-w-[80px]">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            className={`block w-full px-3 py-1.5 text-xs text-left hover:bg-indigo-600 hover:text-white ${playbackRate === rate ? "text-indigo-400 font-bold" : "text-white/80"}`}
                            onClick={() => {
                              setPlaybackRate(rate);
                              if (videoRef.current) videoRef.current.playbackRate = rate;
                              setShowSpeedMenu(false);
                            }}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={handleAddBookmark} title="Bookmark active position">
                    <Bookmark className="h-4.5 w-4.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={handlePiP}>
                    <Share2 className="h-4.5 w-4.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={handleFullscreen}>
                    <Maximize className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lecture Info and Navigation bottom panel */}
          <div className="bg-slate-950 p-5 flex-shrink-0 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-white font-extrabold text-base leading-tight truncate max-w-xl">{currentTopic?.title}</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Topic {activeIndex + 1} of {allTopics.length} in this course</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white font-semibold"
                disabled={!prevTopic}
                onClick={() => dispatch(setCurrentTopic(prevTopic))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/10"
                disabled={!nextTopic}
                onClick={() => dispatch(setCurrentTopic(nextTopic))}
              >
                Next Lesson
              </Button>
            </div>
          </div>
        </div>

        {/* Right Tabbed Panel Container */}
        {sidebarOpen && (
          <div className="w-80 bg-slate-950 border-l border-white/5 flex flex-col overflow-hidden shrink-0 z-10">
            {/* Tabs Header */}
            <div className="flex border-b border-white/5 bg-slate-950/40 p-1">
              {[
                { id: "ai", label: "AI" },
                { id: "notes", label: "Notes" },
                { id: "bookmarks", label: "Marks" },
                { id: "discussion", label: "Chat" },
                { id: "resources", label: "Files" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white font-black shadow"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content viewer */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {activeTab === "ai" && (
                <div className="flex flex-col h-full space-y-4">
                  {/* AI Sub-options selector */}
                  <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1 rounded-xl border border-white/5">
                    {[
                      { id: "chat", label: "Chat", icon: MessageSquare },
                      { id: "summarize", label: "Summ", icon: BookOpen },
                      { id: "explain", label: "Expl", icon: HelpCircle },
                      { id: "notes", label: "Notes", icon: BookOpen },
                      { id: "quiz", label: "Quiz", icon: Award }
                    ].map(subOpt => {
                      const SubIcon = subOpt.icon;
                      const isSubActive = aiOption === subOpt.id;
                      return (
                        <button
                          key={subOpt.id}
                          onClick={() => setAiOption(subOpt.id)}
                          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
                            isSubActive
                              ? "bg-amber-500 text-slate-950 font-bold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          }`}
                        >
                          <SubIcon className="h-3.5 w-3.5" />
                          <span className="text-[8px] mt-0.5 tracking-tight font-semibold uppercase">{subOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-option Content Area */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    {/* 1. Chat Sub-tab */}
                    {aiOption === "chat" && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
                          {aiMessages.map((msg, i) => (
                            <div key={i} className={`flex flex-col space-y-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                              <span className={`text-[10px] uppercase tracking-wider font-extrabold ${msg.sender === "user" ? "text-indigo-400" : "text-amber-400"}`}>
                                {msg.sender === "user" ? "You" : "AI study assistant"}
                              </span>
                              <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed max-w-[90%] border ${
                                msg.sender === "user"
                                  ? "bg-indigo-600/10 border-indigo-500/25 text-white"
                                  : "bg-slate-900 border-slate-800 text-slate-200"
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          {aiLoading && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                              <span>Thinking...</span>
                            </div>
                          )}
                        </div>
                        <form onSubmit={handleAskAI} className="flex gap-2 pt-2 border-t border-white/5">
                          <input
                            type="text"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            placeholder="Ask AI about this topic..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
                          />
                          <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    )}

                    {/* 2. Summarize Sub-tab */}
                    {aiOption === "summarize" && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3.5 scrollbar-thin text-xs text-slate-300 font-semibold leading-relaxed">
                          {aiSummaryText ? (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl whitespace-pre-line">
                              {aiSummaryText}
                            </div>
                          ) : (
                            <div className="text-center py-10 space-y-3">
                              <BookOpen className="h-8 w-8 text-slate-500 mx-auto" />
                              <p className="text-slate-400">Generate a comprehensive summary of this lecture's material.</p>
                            </div>
                          )}
                          {aiLoading && (
                            <div className="flex items-center justify-center gap-2 text-xs text-amber-500 font-bold py-4">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                              <span>Generating Summary...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          {!aiSummaryText ? (
                            <Button onClick={handleSummarizeLecture} disabled={aiLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                              Generate Summary
                            </Button>
                          ) : (
                            <>
                              <Button onClick={handleSummarizeLecture} disabled={aiLoading} variant="outline" className="flex-1 border-slate-800 text-slate-300 font-semibold">
                                Regenerate
                              </Button>
                              <Button onClick={() => handleSaveAiNotesToMyNotes(aiSummaryText, "Lecture Summary")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">
                                Save to My Notes
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. Explain Sub-tab */}
                    {aiOption === "explain" && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3.5 scrollbar-thin text-xs text-slate-300 font-semibold leading-relaxed">
                          {aiExplainText ? (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl whitespace-pre-line">
                              {aiExplainText}
                            </div>
                          ) : (
                            <div className="text-center py-10 space-y-3">
                              <HelpCircle className="h-8 w-8 text-slate-500 mx-auto" />
                              <p className="text-slate-400">Explain the core concepts of this topic in simple terms with analogies.</p>
                            </div>
                          )}
                          {aiLoading && (
                            <div className="flex items-center justify-center gap-2 text-xs text-amber-500 font-bold py-4">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                              <span>Analyzing Concepts...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          {!aiExplainText ? (
                            <Button onClick={handleExplainConcept} disabled={aiLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                              Explain Concept
                            </Button>
                          ) : (
                            <>
                              <Button onClick={handleExplainConcept} disabled={aiLoading} variant="outline" className="flex-1 border-slate-800 text-slate-300 font-semibold">
                                Re-explain
                              </Button>
                              <Button onClick={() => handleSaveAiNotesToMyNotes(aiExplainText, "Concept Explanation")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">
                                Save to My Notes
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 4. Notes Sub-tab */}
                    {aiOption === "notes" && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3.5 scrollbar-thin text-xs text-slate-300 font-semibold leading-relaxed">
                          {aiNotesText ? (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl whitespace-pre-line">
                              {aiNotesText}
                            </div>
                          ) : (
                            <div className="text-center py-10 space-y-3">
                              <BookOpen className="h-8 w-8 text-slate-500 mx-auto" />
                              <p className="text-slate-400">Generate structured study notes complete with code templates.</p>
                            </div>
                          )}
                          {aiLoading && (
                            <div className="flex items-center justify-center gap-2 text-xs text-amber-500 font-bold py-4">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                              <span>Drafting Study Notes...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          {!aiNotesText ? (
                            <Button onClick={handleGenerateNotes} disabled={aiLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                              Generate Notes
                            </Button>
                          ) : (
                            <>
                              <Button onClick={handleGenerateNotes} disabled={aiLoading} variant="outline" className="flex-1 border-slate-800 text-slate-300 font-semibold">
                                Regenerate
                              </Button>
                              <Button onClick={() => handleSaveAiNotesToMyNotes(aiNotesText, "AI Notes")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">
                                Save to My Notes
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 5. Quiz Sub-tab */}
                    {aiOption === "quiz" && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-4 scrollbar-thin">
                          {aiQuizQuestions.length > 0 ? (
                            <div className="space-y-4">
                              {aiQuizQuestions.map((q, qIdx) => {
                                const selectedOption = aiQuizAnswers[qIdx];
                                const isCorrect = selectedOption === q.correctOption;
                                return (
                                  <div key={qIdx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                                    <p className="font-bold text-white">{qIdx + 1}. {q.questionText}</p>
                                    <div className="space-y-1.5">
                                      {q.options.map((opt, oIdx) => {
                                        const isSelected = selectedOption === oIdx;
                                        let btnClass = "w-full text-left p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-white/5 transition-all text-xs font-semibold";
                                        
                                        if (aiQuizSubmitted) {
                                          if (oIdx === q.correctOption) {
                                            btnClass = "w-full text-left p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold";
                                          } else if (isSelected && !isCorrect) {
                                            btnClass = "w-full text-left p-2 rounded-lg border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-bold";
                                          } else {
                                            btnClass = "w-full text-left p-2 rounded-lg border-slate-850 bg-slate-950 text-slate-600 text-xs font-semibold opacity-60";
                                          }
                                        } else if (isSelected) {
                                          btnClass = "w-full text-left p-2 rounded-lg border border-amber-500/50 bg-amber-500/10 text-amber-400 text-xs font-bold";
                                        }

                                        return (
                                          <button
                                            key={oIdx}
                                            disabled={aiQuizSubmitted}
                                            onClick={() => setAiQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                            className={btnClass}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {aiQuizSubmitted && (
                                      <p className="text-[10px] text-slate-400 mt-2 bg-slate-950/40 p-2 rounded border border-white/5 font-semibold">
                                        <span className="font-extrabold text-amber-500">Explanation:</span> {q.explanation}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}

                              {aiQuizSubmitted && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center space-y-1">
                                  <p className="text-xs font-black text-amber-400">Quiz Submitted!</p>
                                  <p className="text-[10px] font-extrabold text-white">
                                    Score: {Object.keys(aiQuizAnswers).filter(idx => aiQuizAnswers[idx] === aiQuizQuestions[idx].correctOption).length} / {aiQuizQuestions.length} correct
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-10 space-y-3">
                              <Award className="h-8 w-8 text-slate-500 mx-auto" />
                              <p className="text-slate-400">Generate a live self-assessment quiz on this topic.</p>
                            </div>
                          )}
                          {aiLoading && (
                            <div className="flex items-center justify-center gap-2 text-xs text-amber-500 font-bold py-4">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                              <span>Generating Practice Quiz...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          {!aiQuizQuestions.length || aiQuizSubmitted ? (
                            <Button onClick={handleGeneratePracticeQuiz} disabled={aiLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                              {aiQuizSubmitted ? "Try New Quiz" : "Generate Practice Quiz"}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setAiQuizSubmitted(true)}
                              disabled={aiLoading || Object.keys(aiQuizAnswers).length !== aiQuizQuestions.length}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                            >
                              Submit Answers
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-4">
                  {/* Form to add note */}
                  <form onSubmit={handleSaveNote} className="space-y-3 p-3 border border-slate-800 rounded-xl bg-slate-900/40">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Take a personal study note here..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 min-h-[80px] text-white resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noteTimestamped}
                          onChange={(e) => setNoteTimestamped(e.target.checked)}
                          className="accent-indigo-500 w-3 h-3"
                        />
                        Link to {formatTime(currentTime)}
                      </label>
                      <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold py-1 px-3">
                        Save Note
                      </Button>
                    </div>
                  </form>

                  {/* Notes list */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-1">Notes History</p>
                    {notes.filter(n => n.topicId.toString() === currentTopic?._id.toString()).length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No notes saved in this lesson.</p>
                    ) : (
                      notes
                        .filter(n => n.topicId.toString() === currentTopic?._id.toString())
                        .map((note) => (
                          <div key={note._id} className="p-3 border border-slate-800 rounded-xl bg-slate-900/60 space-y-1">
                            <div className="flex justify-between items-center">
                              {note.videoPosition > 0 ? (
                                <button
                                  onClick={() => handleSeekTo(note.videoPosition)}
                                  className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  <Clock className="h-3 w-3" /> {formatTime(note.videoPosition)}
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">General Note</span>
                              )}
                              <span className="text-[9px] text-slate-500 font-medium">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-200 font-medium leading-relaxed break-words">{note.content}</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "bookmarks" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Timestamps</p>
                    <Button onClick={handleAddBookmark} size="xs" variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white font-semibold">
                      Add Bookmark
                    </Button>
                  </div>
                  {bookmarks.filter(b => b.topicId.toString() === currentTopic?._id.toString()).length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No bookmarks added. Tap Bookmark button to highlight a timestamp.</p>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks
                        .filter(b => b.topicId.toString() === currentTopic?._id.toString())
                        .map((b) => (
                          <button
                            key={b._id}
                            onClick={() => handleSeekTo(b.videoPosition)}
                            className="w-full flex items-center justify-between p-3 border border-slate-800 rounded-xl bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-500/25 transition-all text-left"
                          >
                            <span className="text-xs font-semibold text-slate-200 truncate pr-3">{b.title}</span>
                            <span className="text-xs font-mono font-bold text-indigo-400 shrink-0">{formatTime(b.videoPosition)}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "discussion" && (
                <div className="flex flex-col h-full space-y-4 justify-between">
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                    {discussions.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No comments posted. Start the discussion!</p>
                    ) : (
                      discussions.map((msg, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                            {msg.user?.name.substring(0,2)}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-bold text-slate-300 truncate pr-2">{msg.user?.name}</span>
                              <span className="text-[9px] text-slate-500 shrink-0">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold leading-relaxed break-words">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-white/5">
                    <input
                      type="text"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Share your thoughts with the class..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest border-b border-white/5 pb-1">Attachments</p>
                  {!currentTopic?.resources || currentTopic.resources.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No downloadable resources configured for this topic.</p>
                  ) : (
                    <div className="space-y-2">
                      {currentTopic.resources.map((r, i) => (
                        <a
                          key={i}
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 border border-slate-800 rounded-xl bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-500/25 transition-all"
                        >
                          <span className="text-xs font-semibold text-slate-200 truncate pr-3">{r.title || "Lecture Document"}</span>
                          <Download className="h-4 w-4 text-indigo-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Course Syllabus Topics Navigation Sidebar */}
            <div className="border-t border-white/5 bg-slate-950 p-4 shrink-0 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Course Syllabus</span>
                {progress && (
                  <span className="text-[10px] font-bold text-indigo-400">{progress.progress}% Complete</span>
                )}
              </div>
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {course?.modules?.map((mod) => (
                  <div key={mod._id} className="space-y-1">
                    <p className="text-[10px] font-extrabold text-slate-500 truncate uppercase tracking-widest">{mod.title}</p>
                    <div className="space-y-1">
                      {mod.topics?.map((topic) => {
                        const isCompleted = progress?.lectureProgress?.some(
                          (l) => l.lectureId.toString() === topic._id.toString() && l.completed
                        );
                        const isActive = currentTopic?._id === topic._id;
                        return (
                          <button
                            key={topic._id}
                            onClick={() => dispatch(setCurrentTopic(topic))}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                              isActive
                                ? "bg-indigo-600 text-white font-bold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            }`}
                          >
                            <span className="truncate max-w-[150px]">{topic.title}</span>
                            {isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <PlayCircle className="h-3.5 w-3.5 text-slate-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}