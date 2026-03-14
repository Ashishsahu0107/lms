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
  Image,
  File,
  Book,
  PenTool,
  HelpCircle
} from "lucide-react";

const CourseContent = ({ content, isEnrolled, onTopicClick }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); // content, resources, notes
  const [userNotes, setUserNotes] = useState({});

  if (!content) return null;

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
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
    // Save notes to localStorage or state
    const updatedNotes = { ...userNotes, [selectedTopic.id]: userNotes[selectedTopic.id] };
    setUserNotes(updatedNotes);
    localStorage.setItem(`topic_notes_${selectedTopic.id}`, userNotes[selectedTopic.id]);
    alert("Notes saved successfully!");
  };

  const getTopicIcon = (type, completed) => {
    if (completed) return <CheckCircle className="w-5 h-5 text-green-500" />;
    
    switch(type) {
      case "video":
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case "quiz":
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "exercise":
        return <Code className="w-5 h-5 text-purple-500" />;
      case "article":
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case "reading":
        return <Book className="w-5 h-5 text-indigo-500" />;
      case "assignment":
        return <PenTool className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const totalTopics = content.sections?.reduce((acc, section) => 
    acc + (section.topics?.length || 0), 0
  ) || 0;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Course Content</h2>

        {/* Course Sections */}
        <div className="space-y-4">
          {content.sections?.map((section) => (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              {/* Section Header */}
              <div 
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{section.topics?.length || 0} topics</span>
                    <span>{section.duration}</span>
                  </div>
                </div>
                <span className="text-gray-500">
                  {expandedSections[section.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </div>

              {/* Section Topics */}
              {expandedSections[section.id] && (
                <div className="divide-y">
                  {section.topics?.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${
                        !isEnrolled ? 'opacity-75' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getTopicIcon(topic.type, topic.completed)}
                        <div>
                          <span className={topic.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                            {topic.title}
                          </span>
                          {topic.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {topic.duration}
                        </span>
                        
                        {!isEnrolled && <Lock size={14} className="text-gray-400" />}
                        
                        {topic.hasReading && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            📖 Reading
                          </span>
                        )}
                        
                        {topic.hasCode && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                            💻 Code
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Not enrolled message */}
        {!isEnrolled && (
          <div className="mt-6 p-6 bg-blue-50 rounded-lg text-center">
            <Lock className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">Course content is locked</h3>
            <p className="text-sm text-blue-600 mb-4">
              Enroll in this course to access all {totalTopics} topics with learning materials
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Enroll Now
            </button>
          </div>
        )}
      </div>

      {/* Topic Content Modal */}
      {showTopicModal && selectedTopic && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  {getTopicIcon(selectedTopic.type, selectedTopic.completed)}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedTopic.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {selectedTopic.duration}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                        {selectedTopic.type}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b px-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`py-3 font-medium text-sm border-b-2 transition ${
                      activeTab === "content"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    📖 Learning Content
                  </button>
                  <button
                    onClick={() => setActiveTab("resources")}
                    className={`py-3 font-medium text-sm border-b-2 transition ${
                      activeTab === "resources"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    📚 Resources
                  </button>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`py-3 font-medium text-sm border-b-2 transition ${
                      activeTab === "notes"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    📝 My Notes
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                {/* Learning Content Tab - TEXT FORM */}
                {activeTab === "content" && (
                  <div className="prose max-w-none">
                    {/* Topic Introduction */}
                    {selectedTopic.introduction && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Introduction</h3>
                        <p className="text-gray-700 leading-relaxed">{selectedTopic.introduction}</p>
                      </div>
                    )}

                    {/* Main Content - Text Form */}
                    {selectedTopic.content && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Material</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {typeof selectedTopic.content === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedTopic.content }} />
                          ) : (
                            selectedTopic.content.map((para, idx) => (
                              <p key={idx} className="text-gray-700 mb-3 leading-relaxed">{para}</p>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key Points - Bullet Points */}
                    {selectedTopic.keyPoints && selectedTopic.keyPoints.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedTopic.keyPoints.map((point, idx) => (
                            <li key={idx} className="text-gray-700">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Code Examples - Text Form */}
                    {selectedTopic.codeExamples && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Code Example</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                          <code>{selectedTopic.codeExamples}</code>
                        </pre>
                      </div>
                    )}

                    {/* Definitions - Table Form */}
                    {selectedTopic.definitions && selectedTopic.definitions.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Terms</h3>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Definition</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedTopic.definitions.map((def, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{def.term}</td>
                                  <td className="px-4 py-2 text-sm text-gray-700">{def.definition}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {selectedTopic.summary && (
                      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Summary</h3>
                        <p className="text-blue-700">{selectedTopic.summary}</p>
                      </div>
                    )}

                    {/* Practice Questions */}
                    {selectedTopic.practiceQuestions && selectedTopic.practiceQuestions.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Practice Questions</h3>
                        <div className="space-y-3">
                          {selectedTopic.practiceQuestions.map((q, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-gray-900">Q{idx + 1}: {q.question}</p>
                              {q.answer && (
                                <p className="text-sm text-green-600 mt-1">Answer: {q.answer}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Resources Tab */}
                {activeTab === "resources" && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Additional Resources</h4>
                    
                    {selectedTopic.resources && selectedTopic.resources.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTopic.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="flex items-center gap-3">
                              {resource.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                              {resource.type === 'article' && <BookOpen className="w-5 h-5 text-green-500" />}
                              {resource.type === 'code' && <Code className="w-5 h-5 text-blue-500" />}
                              <div>
                                <p className="font-medium text-gray-900">{resource.name}</p>
                                <p className="text-xs text-gray-500">{resource.type}</p>
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No additional resources available</p>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Your Personal Notes</h4>
                    <textarea
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your notes here... (What you learned, questions, important points)"
                      value={userNotes[selectedTopic.id] || ""}
                      onChange={(e) => setUserNotes({...userNotes, [selectedTopic.id]: e.target.value})}
                    ></textarea>
                    <button 
                      onClick={handleSaveNotes}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Save Notes
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center px-6 py-4 border-t">
                <div className="flex items-center gap-3">
                  {selectedTopic.completed ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle size={18} />
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        // Mark as completed logic
                        console.log("Mark as completed:", selectedTopic.id);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseContent;