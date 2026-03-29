import React, { useState } from "react";
import {
  PlayCircle,
  CheckCircle,
  Clock,
  Lock,
  FileText,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  Code,
  Book,
  PenTool
} from "lucide-react";

const CourseContent = ({ content, isEnrolled, onTopicClick }) => {

  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [userNotes, setUserNotes] = useState({});

  if (!content) return null;

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleTopicClick = (topic) => {
    if (!isEnrolled) return;

    setSelectedTopic(topic);
    setShowTopicModal(true);
    setActiveTab("content");

    if (onTopicClick) {
      onTopicClick(topic.id);
    }
  };

  const closeModal = () => {
    setShowTopicModal(false);
    setSelectedTopic(null);
  };

  const handleSaveNotes = () => {
    localStorage.setItem(
      `topic_notes_${selectedTopic.id}`,
      userNotes[selectedTopic.id]
    );
    alert("Notes saved successfully!");
  };

  const getTopicIcon = (type, completed) => {
    if (completed) return <CheckCircle className="w-5 h-5 text-green-500" />;

    switch (type) {
      case "video":
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case "quiz":
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "exercise":
        return <Code className="w-5 h-5 text-purple-500" />;
      case "reading":
        return <Book className="w-5 h-5 text-indigo-500" />;
      case "assignment":
        return <PenTool className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">

        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          Course Content
        </h2>

        <div className="space-y-4">

          {content.sections?.map((section) => (

            <div key={section.id} className="border rounded-lg overflow-hidden">

              {/* SECTION HEADER */}
              <div
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {section.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                    <span>{section.topics?.length || 0} topics</span>
                    <span>{section.duration}</span>
                  </div>
                </div>

                {expandedSections[section.id] ?
                  <ChevronUp size={20}/> :
                  <ChevronDown size={20}/>
                }

              </div>

              {/* TOPICS */}
              {expandedSections[section.id] && (

                <div className="divide-y">

                  {section.topics?.map((topic) => (

                    <div
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 transition ${
                        !isEnrolled ? "opacity-70" : "cursor-pointer"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        {getTopicIcon(topic.type, topic.completed)}

                        <div>

                          <p className={`font-medium ${
                            topic.completed
                              ? "line-through text-gray-500"
                              : "text-gray-900"
                          }`}>
                            {topic.title}
                          </p>

                          {topic.description && (
                            <p className="text-xs text-gray-500">
                              {topic.description}
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500">

                        <span className="flex items-center gap-1">
                          <Clock size={14}/>
                          {topic.duration}
                        </span>

                        {!isEnrolled && (
                          <Lock size={14} className="text-gray-400"/>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

      {/* MODAL */}
      {showTopicModal && selectedTopic && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">

            {/* HEADER */}
            <div className="flex justify-between items-start p-4 border-b">

              <div>
                <h3 className="text-lg sm:text-xl font-semibold">
                  {selectedTopic.title}
                </h3>

                <div className="flex gap-3 text-sm text-gray-500 mt-1">
                  <span>{selectedTopic.duration}</span>
                  <span>{selectedTopic.type}</span>
                </div>
              </div>

              <button onClick={closeModal}>
                <X/>
              </button>

            </div>

            {/* TABS */}
            <div className="border-b overflow-x-auto">

              <div className="flex gap-6 px-4 whitespace-nowrap">

                <button
                  onClick={() => setActiveTab("content")}
                  className={`py-3 border-b-2 ${
                    activeTab === "content"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  Content
                </button>

                <button
                  onClick={() => setActiveTab("resources")}
                  className={`py-3 border-b-2 ${
                    activeTab === "resources"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  Resources
                </button>

                <button
                  onClick={() => setActiveTab("notes")}
                  className={`py-3 border-b-2 ${
                    activeTab === "notes"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  Notes
                </button>

              </div>

            </div>

            {/* BODY */}
            <div className="p-4 overflow-y-auto flex-1">

              {activeTab === "content" && (

                <div className="space-y-4">

                  {selectedTopic.content && (

                    <div className="bg-gray-50 p-4 rounded-lg">

                      {Array.isArray(selectedTopic.content)
                        ? selectedTopic.content.map((p, i) => (
                            <p key={i} className="text-gray-700 mb-2">
                              {p}
                            </p>
                          ))
                        : (
                          <div dangerouslySetInnerHTML={{
                            __html: selectedTopic.content
                          }} />
                        )
                      }

                    </div>

                  )}

                </div>

              )}

              {activeTab === "resources" && (
                <p className="text-gray-500">
                  No resources available
                </p>
              )}

              {activeTab === "notes" && (

                <div>

                  <textarea
                    className="w-full h-48 border p-3 rounded-lg"
                    placeholder="Write your notes..."
                    value={userNotes[selectedTopic.id] || ""}
                    onChange={(e) =>
                      setUserNotes({
                        ...userNotes,
                        [selectedTopic.id]: e.target.value
                      })
                    }
                  />

                  <button
                    onClick={handleSaveNotes}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Save Notes
                  </button>

                </div>

              )}

            </div>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 border-t">

              <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                Mark as Completed
              </button>

              <button
                onClick={closeModal}
                className="border px-4 py-2 rounded-lg"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default CourseContent;
