import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const StudentQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // This would need to be implemented in the backend
        // For now, showing a placeholder
        setQuizzes([
          {
            _id: '1',
            title: 'JavaScript Fundamentals',
            course: { title: 'Web Development' },
            questions: 20,
            duration: 30,
            attempts: 0,
            bestScore: null,
            status: 'available'
          }
        ]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId) => {
    // Navigate to quiz taking page
    window.location.href = `/quiz/${quizId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Available Quizzes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge with interactive quizzes.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {quiz.title}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div>Course: {quiz.course?.title}</div>
                <div>Questions: {quiz.questions}</div>
                <div>Duration: {quiz.duration} minutes</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Attempts:</span>
                <span className="font-medium text-gray-900 dark:text-white">{quiz.attempts}</span>
              </div>
              {quiz.bestScore !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Best Score:</span>
                  <span className="font-medium text-green-600">{quiz.bestScore}%</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                quiz.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {quiz.status}
              </span>
              
              <button
                onClick={() => handleStartQuiz(quiz._id)}
                disabled={quiz.status !== 'available'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {quiz.status === 'available' ? 'Start Quiz' : 'Not Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400 text-lg">
            No quizzes available at the moment.
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuiz;
