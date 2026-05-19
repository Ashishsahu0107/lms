import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize,
  ChevronLeft, ChevronRight, CheckCircle2, Download, MessageSquare,
  BookmarkPlus, BookOpen, Settings, List, X, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Modal } from "../../../components/ui/Modal";

const dummyPlayer = {
  courseId: "1",
  courseTitle: "Advanced JavaScript",
  currentLecture: {
    id: 9,
    title: "Promises Deep Dive",
    description: "Learn how Promises work under the hood and how to use them effectively in modern JavaScript applications.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: 1400,
    resources: [
      { name: "Promise Cheat Sheet.pdf", size: "245 KB" },
      { name: "Code Examples.zip", size: "1.2 MB" },
    ]
  },
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
  ],
  progress: 45,
  completedLectures: 8,
  totalLectures: 24,
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function CoursePlayer() {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(dummyPlayer.currentLecture.duration);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [markCompleteModal, setMarkCompleteModal] = useState(false);

  const currentLecture = dummyPlayer.currentLecture;
  const allLectures = dummyPlayer.sections.flatMap(s => s.lectures);
  const currentIdx = allLectures.findIndex(l => l.id === parseInt(lectureId));
  const prevLecture = currentIdx > 0 ? allLectures[currentIdx - 1] : null;
  const nextLecture = currentIdx < allLectures.length - 1 ? allLectures[currentIdx + 1] : null;

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (delta) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    }
  };

  const changeVolume = (v) => {
    if (videoRef.current) videoRef.current.volume = v;
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleMarkComplete = () => {
    setMarkCompleteModal(false);
    if (nextLecture) navigate(`/student/course/${courseId}/player/${nextLecture.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-[#1a1a2e] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link to={`/student/course/${courseId}`} className="text-white/70 hover:text-white flex items-center gap-1 text-sm transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Course
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-white font-medium text-sm truncate max-w-xs">{dummyPlayer.courseTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => setShowNotes(!showNotes)}>
            <BookmarkPlus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="relative bg-black flex-1 flex items-center justify-center">
            <video
              ref={videoRef}
              src={currentLecture.videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || currentLecture.duration)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <ProgressBar
                value={(currentTime / duration) * 100}
                className="mb-3 [&>div]:bg-primary"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:text-white" onClick={() => seek(-10)}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:text-white w-12 h-12" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:text-white" onClick={() => seek(10)}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <span className="text-white text-sm ml-2 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-white/70">
                    {muted || volume === 0 ? (
                      <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={toggleMute}>
                        <VolumeX className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={toggleMute}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                    <input
                      type="range" min="0" max="1" step="0.1" value={muted ? 0 : volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-20 accent-primary"
                    />
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white text-sm" onClick={() => setShowSpeedMenu(!showSpeedMenu)}>
                      {playbackRate}x
                    </Button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#2a2a3e] rounded-lg shadow-xl py-2 z-50">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <button key={rate} className="block w-full px-4 py-1.5 text-sm text-white hover:bg-white/10 text-left" onClick={() => { setPlaybackRate(rate); if (videoRef.current) videoRef.current.playbackRate = rate; setShowSpeedMenu(false); }}>
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:text-white">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lecture Info */}
          <div className="bg-[#1a1a2e] p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{currentLecture.title}</h2>
                <p className="text-white/60 text-sm mt-1">Lecture {currentIdx + 1} of {allLectures.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 gap-1" onClick={() => setMarkCompleteModal(true)}>
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
                {prevLecture && (
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" as={Link} to={`/student/course/${courseId}/player/${prevLecture.id}`}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                {nextLecture && (
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" as={Link} to={`/student/course/${courseId}/player/${nextLecture.id}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Notes/Resources */}
        {showNotes && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-80 bg-[#1a1a2e] border-l border-white/10 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-white font-medium text-sm">Notes</span>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white h-8 w-8" onClick={() => setShowNotes(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 flex-1">
              <textarea
                className="w-full h-full bg-transparent text-white text-sm resize-none outline-none placeholder:text-white/30"
                placeholder="Take notes for this lecture..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-white/10">
              <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10 gap-2">
                <Download className="h-4 w-4" /> Export Notes
              </Button>
            </div>
          </motion.div>
        )}

        {/* Lecture Sidebar */}
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 320 }}
            className="w-80 bg-[#1a1a2e] border-l border-white/10 flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-white/10">
              <p className="text-white font-medium text-sm">Course Content</p>
              <p className="text-white/50 text-xs mt-0.5">{dummyPlayer.completedLectures}/{dummyPlayer.totalLectures} completed</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {dummyPlayer.sections.map((section, sIdx) => (
                <div key={sIdx} className="border-b border-white/5">
                  <div className="px-3 py-2 bg-white/5">
                    <p className="text-white/80 text-xs font-medium">{section.title}</p>
                  </div>
                  {section.lectures.map(lecture => (
                    <Link
                      key={lecture.id}
                      to={`/student/course/${courseId}/player/${lecture.id}`}
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                        lecture.id === parseInt(lectureId)
                          ? "bg-primary/20 text-primary border-l-2 border-primary"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lecture.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Play className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="flex-1 truncate">{lecture.title}</span>
                      <span className="text-xs text-white/30">{formatTime(lecture.duration)}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            {/* Resources */}
            <div className="p-3 border-t border-white/10">
              <p className="text-white/60 text-xs font-medium mb-2">Resources</p>
              {currentLecture.resources.map((r, i) => (
                <Button key={i} variant="ghost" size="sm" className="w-full justify-start text-white/60 hover:text-white text-xs h-8 gap-2">
                  <Download className="h-3 w-3" /> {r.name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mark Complete Modal */}
      <Modal isOpen={markCompleteModal} onClose={() => setMarkCompleteModal(false)} title="Mark as Complete" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Mark this lecture as completed?</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setMarkCompleteModal(false)}>Cancel</Button>
            <Button onClick={handleMarkComplete} className="gap-2"><CheckCircle2 className="h-4 w-4" /> Complete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}