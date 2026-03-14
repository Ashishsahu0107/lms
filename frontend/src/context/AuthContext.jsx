import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

let mockUsers = [
  {
    id: 1,
    email: "john@example.com",
    password: "password123",
    name: "John Doe",
    avatar: "JD",
    role: "Student",
    course: "React Development",
    joinDate: "2026-01-15",
    phone: "+1 234 567 8900",
    location: "New York, USA",
    bio: "Passionate web developer learning React and modern web technologies.",
    education: {
      university: "Tech University",
      degree: "Computer Science",
      year: "2024-2028"
    },
    social: {
      github: "johndoe",
      linkedin: "johndoe",
      twitter: "johndoe"
    },
    enrolledCourses: [1, 2],
    completedCourses: [3],
    streak: {
      current: 15,
      longest: 32,
      lastActive: "2026-03-10"
    },
    achievements: [
      { id: 1, title: "Quick Learner", description: "Completed 5 modules in a week", icon: "⚡", date: "Mar 2026" },
      { id: 2, title: "Quiz Master", description: "Scored 90%+ in 3 quizzes", icon: "🏆", date: "Feb 2026" }
    ]
  },
  {
    id: 2,
    email: "jane@example.com",
    password: "password123",
    name: "Jane Smith",
    avatar: "JS",
    role: "Student",
    course: "JavaScript Advanced",
    joinDate: "2026-02-01",
    enrolledCourses: [2, 3],
    completedCourses: [1]
  },
  {
    id: 3,
    email: "test@test.com",
    password: "password",
    name: "Test User",
    avatar: "TU",
    role: "Student",
    course: "Database Systems",
    joinDate: "2026-03-01",
    enrolledCourses: [1, 3],
    completedCourses: []
  }
];

const mockCourses = [
  {
    id: 1,
    title: "React Development",
    description: "Master React.js from basics to advanced concepts.",
    instructor: "John Doe",
    category: "Web Development",
    difficulty: "Intermediate",
    duration: 40,
    rating: 4.8,
    thumbnail: "https://picsum.photos/400/200?random=1",
    progress: 75
  },
  {
    id: 2,
    title: "JavaScript Advanced",
    description: "Deep dive into closures, promises, async/await.",
    instructor: "Jane Smith",
    category: "Programming",
    difficulty: "Advanced",
    duration: 35,
    rating: 4.7,
    thumbnail: "https://picsum.photos/400/200?random=2",
    progress: 60
  },
  {
    id: 3,
    title: "Database Systems",
    description: "Learn SQL, MongoDB, database design.",
    instructor: "Mike Johnson",
    category: "Database",
    difficulty: "Intermediate",
    duration: 45,
    rating: 4.9,
    thumbnail: "https://picsum.photos/400/200?random=3",
    progress: 30
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          loadEnrolledCourses(userData.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadEnrolledCourses = (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user && user.enrolledCourses) {
      const courses = mockCourses.filter(course => 
        user.enrolledCourses.includes(course.id)
      );
      setEnrolledCourses(courses);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      localStorage.setItem("student", JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword);
      loadEnrolledCourses(foundUser.id);
      
      return { user: userWithoutPassword };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUser = mockUsers.find(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (existingUser) {
        throw new Error("User already exists with this email");
      }
      
      const newUser = {
        id: mockUsers.length + 1,
        ...userData,
        avatar: userData.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2),
        role: "Student",
        joinDate: new Date().toISOString().split("T")[0],
        enrolledCourses: [],
        completedCourses: [],
        streak: { current: 0, longest: 0, lastActive: null },
        achievements: []
      };
      
      mockUsers.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      localStorage.setItem("student", JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword);
      setEnrolledCourses([]);
      
      return { user: userWithoutPassword };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = (courseId) => {
    if (!user) return;
    
    const updatedUser = { ...user };
    if (!updatedUser.enrolledCourses) {
      updatedUser.enrolledCourses = [];
    }
    
    if (!updatedUser.enrolledCourses.includes(parseInt(courseId))) {
      updatedUser.enrolledCourses.push(parseInt(courseId));
      
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex].enrolledCourses = updatedUser.enrolledCourses;
      }
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("student", JSON.stringify(updatedUser));
      
      const enrolledIds = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
      if (!enrolledIds.includes(courseId)) {
        enrolledIds.push(courseId);
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolledIds));
      }
      
      loadEnrolledCourses(user.id);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("student");
    localStorage.removeItem("enrolledCourses");
    localStorage.removeItem("studentTasks");
    localStorage.removeItem("quizHistory");
    localStorage.removeItem("learningSupportRequests");
    
    setUser(null);
    setEnrolledCourses([]);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    enrollInCourse,
    enrolledCourses,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;