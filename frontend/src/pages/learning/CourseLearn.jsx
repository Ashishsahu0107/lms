import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle,
  Menu,
  X
} from "lucide-react";

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    if (!enrolledCourses.includes(courseId)) {
      navigate(`/course/${courseId}`);
      return;
    }

    setTimeout(() => {
      const coursesData = {
        "1": {
          id: "1",
          title: "React for Beginners",
          content: {
            sections: [
              {
                id: "s1",
                title: "Getting Started with React",
                duration: "2.5 hours",
                topics: [
                  {
                    id: "t1",
                    title: "Introduction to React",
                    duration: "15 min",
                    type: "video",
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    description: "What is React? Why use it? Overview of React ecosystem."
                  },
                  {
                    id: "t2",
                    title: "Setting Up Development Environment",
                    duration: "20 min",
                    type: "video",
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    description: "Install Node.js, npm, create-react-app."
                  }
                ]
              },
              {
                id: "s2",
                title: "Components & Props",
                duration: "3.5 hours",
                topics: [
                  {
                    id: "t3",
                    title: "Understanding Props",
                    duration: "20 min",
                    type: "video",
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
                  }
                ]
              }
            ]
          }
        },
        "2": {
          id: "2",
          title: "Core Java and Advanced Java",
          content: {
            sections: [
              {
                id: "s1",
                title: "Core Java",
                duration: "4 hours",
                topics: [
                  {
                    id: "t1",
                    title: "Java Introduction",
                    duration: "15 min",
                    type: "video",
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
                  }
                ]
              }
            ]
          }
        }
      };

      const selectedCourse = coursesData[courseId] || coursesData["1"];
      setCourse(selectedCourse);
      
      if (selectedCourse.content.sections[0]?.topics[0]) {
        setCurrentSection(selectedCourse.content.sections[0]);
        setCurrentTopic(selectedCourse.content.sections[0].topics[0]);
      }
      
      const savedProgress = JSON.parse(localStorage.getItem(`course_${courseId}_progress`) || "{}");
      setProgress(savedProgress);
      
      setLoading(false);
    }, 500);
  }, [courseId, navigate]);

  const markAsCompleted = (topicId) => {
    const newProgress = { ...progress, [topicId]: true };
    setProgress(newProgress);
    localStorage.setItem(`course_${courseId}_progress`, JSON.stringify(newProgress));
  };

  const goToNextTopic = () => {
    if (!course || !currentSection || !currentTopic) return;

    const sectionIndex = course.content.sections.findIndex(s => s.id === currentSection.id);
    const topicIndex = currentSection.topics.findIndex(t => t.id === currentTopic.id);

    if (topicIndex < currentSection.topics.length - 1) {
      setCurrentTopic(currentSection.topics[topicIndex + 1]);
    } else if (sectionIndex < course.content.sections.length - 1) {
      const nextSection = course.content.sections[sectionIndex + 1];
      setCurrentSection(nextSection);
      setCurrentTopic(nextSection.topics[0]);
    }
  };

  const goToPreviousTopic = () => {
    if (!course || !currentSection || !currentTopic) return;

    const sectionIndex = course.content.sections.findIndex(s => s.id === currentSection.id);
    const topicIndex = currentSection.topics.findIndex(t => t.id === currentTopic.id);

    if (topicIndex > 0) {
      setCurrentTopic(currentSection.topics[topicIndex - 1]);
    } else if (sectionIndex > 0) {
      const prevSection = course.content.sections[sectionIndex - 1];
      setCurrentSection(prevSection);
      setCurrentTopic(prevSection.topics[prevSection.topics.length - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link to="/courses" className="text-blue-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalTopics = course.content.sections.reduce(
    (acc, section) => acc + section.topics.length, 0
  );
  const completedTopics = Object.keys(progress).filter(id => progress[id]).length;
  const progressPercentage = Math.round((completedTopics / totalTopics) * 100);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            {showSidebar ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to={`/course/${courseId}`} className="text-xl font-bold text-blue-600">
            {course.title}
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <span className="text-sm text-gray-600">Progress: {progressPercentage}%</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          <Link 
            to={`/course/${courseId}`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Course Overview
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showSidebar ? 'block' : 'hidden lg:block'} w-80 bg-white border-r overflow-y-auto`}>
          <div className="p-4">
            <h2 className="font-semibold mb-4">Course Content</h2>
            
            {course.content.sections.map((section) => (
              <div key={section.id} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">{section.title}</h3>
                  <span className="text-xs text-gray-500">{section.duration}</span>
                </div>
                
                <div className="space-y-1">
                  {section.topics.map((topic) => {
                    const isCompleted = progress[topic.id];
                    const isActive = currentTopic?.id === topic.id;
                    
                    return (
                      <button
                        key={topic.id}
                        onClick={() => {
                          setCurrentSection(section);
                          setCurrentTopic(topic);
                        }}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition ${
                          isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <PlayCircle className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                        )}
                        <span className={`flex-1 text-left truncate ${
                          isCompleted ? 'text-gray-500' : ''
                        }`}>
                          {topic.title}
                        </span>
                        <span className="text-xs text-gray-400">{topic.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentTopic && (
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-black rounded-lg overflow-hidden mb-6">
                <div className="aspect-video">
                  <iframe
                    src={currentTopic.videoUrl}
                    title={currentTopic.title}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{currentTopic.title}</h1>
                    <p className="text-gray-600">{currentTopic.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">{currentTopic.duration}</span>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={goToPreviousTopic}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>

                  <button
                    onClick={() => markAsCompleted(currentTopic.id)}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      progress[currentTopic.id]
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    disabled={progress[currentTopic.id]}
                  >
                    {progress[currentTopic.id] ? 'Completed ✓' : 'Mark as Completed'}
                  </button>

                  <button
                    onClick={goToNextTopic}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseLearn;