import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// ============ CUSTOM HOOKS FOR REAL-TIME UPDATES ============

/**
 * Hook for real-time user registration updates
 */
export const useUserRegistration = () => {
  const [newUsers, setNewUsers] = useState([]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('user:registered', (user) => {
      setNewUsers((prev) => [user, ...prev]);
      console.log('New user registered:', user);
    });

    return () => {
      socket.off('user:registered');
    };
  }, []);

  return newUsers;
};

/**
 * Hook for real-time course updates
 */
export const useCourseUpdates = () => {
  const [newCourses, setNewCourses] = useState([]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('course:created', (course) => {
      setNewCourses((prev) => [course, ...prev]);
      console.log('New course created:', course);
    });

    return () => {
      socket.off('course:created');
    };
  }, []);

  return newCourses;
};

/**
 * Hook for real-time progress updates
 */
export const useProgressUpdates = () => {
  const [progressUpdates, setProgressUpdates] = useState([]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('progress:updated', (data) => {
      setProgressUpdates((prev) => [data, ...prev]);
      console.log('Progress updated:', data);
    });

    return () => {
      socket.off('progress:updated');
    };
  }, []);

  return progressUpdates;
};

/**
 * Hook for real-time enrollment updates
 */
export const useEnrollmentUpdates = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('enrollment:created', (data) => {
      setEnrollments((prev) => [data, ...prev]);
      console.log('New enrollment:', data);
    });

    return () => {
      socket.off('enrollment:created');
    };
  }, []);

  return enrollments;
};

/**
 * Hook for real-time announcements
 */
export const useAnnouncements = (courseId) => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const socket = initializeSocket();

    // Listen for announcements in this course
    socket.on(`announcement:${courseId}`, (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev]);
      console.log('New announcement:', announcement);
    });

    return () => {
      socket.off(`announcement:${courseId}`);
    };
  }, [courseId]);

  return announcements;
};

/**
 * Hook for real-time lesson updates
 */
export const useLessonUpdates = (courseId) => {
  const [lessonUpdates, setLessonUpdates] = useState([]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('lesson:updated', (data) => {
      if (data.courseId === courseId) {
        setLessonUpdates((prev) => [data, ...prev]);
        console.log('Lesson updated:', data);
      }
    });

    return () => {
      socket.off('lesson:updated');
    };
  }, [courseId]);

  return lessonUpdates;
};

/**
 * Hook for real-time course user presence
 */
export const useCoursePresence = (courseId) => {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const socket = initializeSocket();

    // Join course room
    socket.emit('course:join', courseId);

    socket.on('course:userJoined', (data) => {
      if (data.courseId === courseId) {
        setActiveUsers((prev) => prev + 1);
        console.log('User joined course:', data);
      }
    });

    socket.on('course:userLeft', (data) => {
      if (data.courseId === courseId) {
        setActiveUsers((prev) => Math.max(0, prev - 1));
        console.log('User left course:', data);
      }
    });

    return () => {
      socket.emit('course:leave', courseId);
      socket.off('course:userJoined');
      socket.off('course:userLeft');
    };
  }, [courseId]);

  return activeUsers;
};

/**
 * Hook for real-time chat messages
 */
export const useCourseChat = (courseId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('chat:newMessage', (data) => {
      if (data.courseId === courseId) {
        setMessages((prev) => [data, ...prev]);
        console.log('New message:', data);
      }
    });

    return () => {
      socket.off('chat:newMessage');
    };
  }, [courseId]);

  const sendMessage = (message) => {
    const socket = getSocket();
    socket.emit('chat:message', {
      courseId,
      message,
      timestamp: new Date().toISOString()
    });
  };

  return { messages, sendMessage };
};

/**
 * Hook to update progress in real-time
 */
export const useProgressUpdate = () => {
  const updateProgress = (courseId, lessonsCompleted, assignmentsCompleted, currentLessonId) => {
    const socket = getSocket();
    socket.emit('progress:update', {
      courseId,
      lessonsCompleted,
      assignmentsCompleted,
      currentLessonId,
      timestamp: new Date().toISOString()
    });
  };

  return updateProgress;
};

/**
 * Hook to update lesson in real-time
 */
export const useLessonUpdate = () => {
  const updateLesson = (courseId, lessonId, status) => {
    const socket = getSocket();
    socket.emit('lesson:update', {
      courseId,
      lessonId,
      status,
      timestamp: new Date().toISOString()
    });
  };

  return updateLesson;
};

export default socket;
