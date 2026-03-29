import { useState, useEffect } from 'react';

export const useCourse = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockCourse = {
          id: courseId,
          title: 'Sample Course',
          description: 'Course description',
          modules: []
        };
        setCourse(mockCourse);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return { course, loading, error };
};

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockCourses = [];
        setCourses(mockCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};

export const useProgress = (userId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Mock data - replace with actual API call
        const mockProgress = {
          enrolledCourses: 0,
          completedCourses: 0,
          totalHours: 0
        };
        setProgress(mockProgress);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  return { progress, loading };
};

export const useAssignments = (courseId) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Mock data - replace with actual API call
        const mockAssignments = [];
        setAssignments(mockAssignments);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  return { assignments, loading };
};

export const useQuizzes = (courseId) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Mock data - replace with actual API call
        const mockQuizzes = [];
        setQuizzes(mockQuizzes);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  return { quizzes, loading };
};
