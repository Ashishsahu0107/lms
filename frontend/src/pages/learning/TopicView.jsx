import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ChevronLeft,
  Clock,
  CheckCircle,
  FileText,
  Download
} from "lucide-react";

const TopicView = () => {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    if (!enrolledCourses.includes(courseId)) {
      navigate(`/course/${courseId}`);
      return;
    }

    setTimeout(() => {
      const topicData = {
        id: topicId,
        title: topicId === "t1" ? "Introduction to React" : "React Components",
        duration: "15 min",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Learn the fundamentals of React and why it's so popular.",
        content: `
          <h3>What is React?</h3>
          <p>React is a JavaScript library for building user interfaces.</p>
        `,
        resources: [
          { name: "Lecture Slides", type: "pdf", size: "2.5 MB", url: "#" }
        ]
      };

      setTopic(topicData);
      
      const progress = JSON.parse(localStorage.getItem(`course_${courseId}_progress`) || "{}");
      setCompleted(!!progress[topicId]);
      
      setLoading(false);
    }, 500);
  }, [courseId, topicId, navigate]);

  const markAsCompleted = () => {
    const progress = JSON.parse(localStorage.getItem(`course_${courseId}_progress`) || "{}");
    progress[topicId] = true;
    localStorage.setItem(`course_${courseId}_progress`, JSON.stringify(progress));
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(`/course/${courseId}/learn`)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ChevronLeft size={20} />
          Back to Course
        </button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-600">{topic?.title}</span>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <div className="aspect-video">
            <iframe
              src={topic?.videoUrl}
              title={topic?.title}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{topic?.title}</h1>
              <p className="text-gray-600">{topic?.description}</p>
            </div>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={16} />
              {topic?.duration}
            </span>
          </div>

          <div 
            className="prose max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: topic?.content }}
          />

          <button
            onClick={markAsCompleted}
            disabled={completed}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              completed
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {completed ? 'Completed ✓' : 'Mark as Completed'}
          </button>
        </div>

        {topic?.resources && topic.resources.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              {topic.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    {resource.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                    <div>
                      <p className="font-medium text-sm">{resource.name}</p>
                      <p className="text-xs text-gray-500">{resource.size}</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-500" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicView;