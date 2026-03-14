import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  PlayCircle, 
  CheckCircle, 
  ChevronRight,
  Award,
  ShoppingCart,
  LogIn,
  UserPlus,
  Download
} from "lucide-react";

// Import course components
import CourseHeader from "../components/course/CourseHeader";
import CourseContent from "../components/course/CourseContent";
import CourseInstructor from "../components/course/CourseInstructor";
import CourseReview from "../components/course/CourseReview";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [course, setCourse] = useState(null);

  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });

  // Check if user is logged in
  const isLoggedIn = !!currentUser;

  useEffect(() => {
    // Load course data from localStorage or use mock data
    setTimeout(() => {
      // Complete course data with all details and topics
      const coursesData = {
        "1": {
          id: "1",
          title: "React for Beginners",
          subtitle: "Master React from scratch - Zero to Hero",
          description: "Learn React fundamentals and build modern web applications. This comprehensive course covers everything from basics to advanced topics including hooks, context API, and Redux.",
          detailedDescription: `Welcome to the complete React course for beginners! This course is designed to take you from absolute beginner to confident React developer.

What makes this course special?
• Hands-on projects - Build real-world applications
• Clear explanations - No fluff, just practical knowledge
• Latest React 18 features - Stay up to date
• Best practices - Write clean, maintainable code

By the end of this course, you'll be able to build complete web applications using React and its ecosystem.`,
          category: "Web Development",
          instructor: {
            name: "John Doe",
            id: "1",
            avatar: "https://picsum.photos/100?random=1",
            title: "Senior React Developer at Google",
            bio: "10+ years of web development experience. Previously worked at Facebook on React team. Passionate about teaching and helping others learn.",
            rating: 4.8,
            students: 12500,
            courses: 8,
            expertise: ["React", "JavaScript", "TypeScript", "Node.js"]
          },
          stats: {
            totalStudents: 12500,
            totalRatings: 2345,
            totalHours: 42,
            totalArticles: 56,
            totalResources: 89,
            language: "English",
            subtitles: "English, Hindi, Spanish",
            lastUpdated: "March 2026"
          },
          chaptersCount: 42,
          rating: 4.8,
          students: 12500,
          price: 49,
          discountedPrice: 29,
          imageUrl: "https://picsum.photos/800/400?random=1",
          thumbnail: "https://picsum.photos/400/200?random=1",
          difficulty: "Beginner to Intermediate",
          language: "English",
          certificate: true,
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
                    type: "reading",
                    completed: false,
                    introduction: "React is a JavaScript library for building user interfaces. It was developed by Facebook and has become one of the most popular front-end libraries in the world.",
                    content: [
                      "React was developed by Facebook and released in 2013 as an open-source library.",
                      "It allows developers to create large web applications that can change data without reloading the page.",
                      "The main purpose of React is to be fast, scalable, and simple. It works by creating a virtual DOM in memory and updating only the parts that have changed.",
                      "React uses a component-based architecture where you build encapsulated components that manage their own state, then compose them to make complex UIs."
                    ],
                    keyPoints: [
                      "Component-based architecture - Build encapsulated components",
                      "Virtual DOM - Improves performance by minimizing direct DOM manipulation",
                      "Unidirectional data flow - Data flows from parent to child components",
                      "JSX syntax - Write HTML-like code in JavaScript",
                      "Declarative - Tell React what you want, and it will figure out how to render it"
                    ],
                    definitions: [
                      { term: "Component", definition: "A reusable piece of UI that can contain its own structure, logic, and styling" },
                      { term: "JSX", definition: "JavaScript XML - a syntax extension that allows you to write HTML-like code in JavaScript" },
                      { term: "Props", definition: "Short for 'properties', these are read-only data passed from parent to child components" },
                      { term: "State", definition: "Internal data of a component that can change over time and affects rendering" },
                      { term: "Virtual DOM", definition: "A lightweight copy of the actual DOM that React uses to optimize updates" }
                    ],
                    summary: "React is a powerful JavaScript library for building user interfaces using reusable components. Its virtual DOM and component-based architecture make it efficient and scalable for modern web applications.",
                    practiceQuestions: [
                      { question: "What is React and who developed it?", answer: "React is a JavaScript library for building user interfaces, developed by Facebook and released in 2013." },
                      { question: "What is the virtual DOM and why is it important?", answer: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to improve performance by updating only the parts that have changed, rather than reloading the entire page." },
                      { question: "What are the key features of React?", answer: "Component-based architecture, virtual DOM, JSX syntax, unidirectional data flow, and declarative programming." },
                      { question: "What is the difference between props and state?", answer: "Props are read-only data passed from parent to child components, while state is internal data that a component manages and can change over time." }
                    ],
                    codeExamples: `// A simple React component
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Using the component
<Welcome name="John" />

// Component with state using hooks
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
                    resources: [
                      { name: "React Official Documentation", type: "article", url: "https://reactjs.org" },
                      { name: "React Getting Started Guide", type: "pdf", size: "1.2 MB", url: "#" },
                      { name: "React Cheat Sheet", type: "pdf", size: "500 KB", url: "#" }
                    ]
                  },
                  {
                    id: "t2",
                    title: "Setting Up React Environment",
                    duration: "20 min",
                    type: "reading",
                    completed: false,
                    introduction: "Before you can start building React applications, you need to set up your development environment. This includes installing Node.js, npm, and creating your first React project.",
                    content: [
                      "Node.js is a JavaScript runtime that allows you to run JavaScript on your computer. It comes with npm (Node Package Manager) which is used to install packages and dependencies.",
                      "Create React App is an officially supported tool for creating React applications. It sets up your development environment with best practices and zero configuration.",
                      "The project structure includes public folder (for static files), src folder (for your source code), package.json (for dependencies), and node_modules (for installed packages)."
                    ],
                    keyPoints: [
                      "Install Node.js from nodejs.org",
                      "npm comes bundled with Node.js",
                      "Use npx create-react-app my-app to create a new project",
                      "npm start runs the development server",
                      "npm build creates a production build"
                    ],
                    definitions: [
                      { term: "Node.js", definition: "A JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on servers" },
                      { term: "npm", definition: "Node Package Manager - the default package manager for Node.js" },
                      { term: "npx", definition: "A tool that runs npm packages without installing them globally" },
                      { term: "Create React App", definition: "An officially supported tool to create React applications with no build configuration" }
                    ],
                    summary: "Setting up React is easy with Create React App. After installing Node.js, you can create a new project with a single command and start developing immediately.",
                    practiceQuestions: [
                      { question: "What is Node.js and why do we need it for React?", answer: "Node.js is a JavaScript runtime that allows us to run JavaScript on our computer. We need it to use npm and run development tools." },
                      { question: "How do you create a new React project?", answer: "Use the command 'npx create-react-app my-app' where 'my-app' is your project name." },
                      { question: "What is the difference between npm start and npm build?", answer: "npm start runs the development server with hot reloading, while npm build creates optimized production files." }
                    ],
                    codeExamples: `# Install Node.js first, then run these commands

# Create a new React app
npx create-react-app my-first-react-app

# Navigate to the project folder
cd my-first-react-app

# Start the development server
npm start

# Build for production
npm run build`,
                    resources: [
                      { name: "Node.js Download", type: "article", url: "https://nodejs.org" },
                      { name: "Create React App Documentation", type: "article", url: "https://create-react-app.dev" },
                      { name: "Setup Guide PDF", type: "pdf", size: "800 KB", url: "#" }
                    ]
                  },
                  {
                    id: "t3",
                    title: "Your First React App",
                    duration: "25 min",
                    type: "reading",
                    completed: false,
                    introduction: "Now that your environment is set up, let's create your first React application. We'll modify the default Create React App template to understand how React works.",
                    content: [
                      "When you create a new React app, you get a basic template with an App component, some CSS, and testing files.",
                      "The App.js file contains the main component. Everything you see in the browser comes from this component.",
                      "React components return JSX, which looks like HTML but is actually JavaScript. This JSX gets transformed into JavaScript that creates DOM elements."
                    ],
                    keyPoints: [
                      "The entry point is index.js which renders App component",
                      "Components return JSX which gets compiled to JavaScript",
                      "You can edit App.js to see changes in real-time",
                      "CSS files can be imported directly into components"
                    ],
                    codeExamples: `// src/App.js - Your first custom React component
import React from 'react';
import './App.css';

function App() {
  const name = "React Developer";
  const currentTime = new Date().toLocaleTimeString();
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome, {name}!</h1>
        <p>Current time: {currentTime}</p>
        <button onClick={() => alert('Hello React!')}>
          Click Me
        </button>
      </header>
    </div>
  );
}

export default App;`,
                    resources: [
                      { name: "React Component Examples", type: "code", url: "#" }
                    ]
                  }
                ]
              },
              {
                id: "s2",
                title: "Components & Props",
                duration: "3.5 hours",
                topics: [
                  {
                    id: "t4",
                    title: "Understanding Props",
                    duration: "20 min",
                    type: "reading",
                    completed: false,
                    introduction: "Props (short for properties) are how data flows from parent components to child components in React. They are read-only and help make components reusable.",
                    content: [
                      "Props are passed to components like HTML attributes. They can be any JavaScript value: strings, numbers, objects, arrays, or even functions.",
                      "Props are immutable - a component cannot change its own props. This ensures that data flows in one direction, making the app easier to understand.",
                      "You can pass multiple props to a component and use them in your JSX with curly braces."
                    ],
                    keyPoints: [
                      "Props are passed from parent to child (unidirectional)",
                      "Props are read-only (immutable)",
                      "Components receive props as an object parameter",
                      "You can pass any data type as props"
                    ],
                    definitions: [
                      { term: "Props", definition: "Read-only data passed from parent to child components" },
                      { term: "Immutable", definition: "Cannot be changed - props should not be modified by the receiving component" },
                      { term: "Children", definition: "A special prop that represents content between opening and closing tags" }
                    ],
                    codeExamples: `// Parent component passing props
function Parent() {
  const user = {
    name: "Alice",
    age: 25,
    isStudent: true
  };
  
  return (
    <div>
      <Greeting name="Bob" />
      <UserInfo user={user} />
      <WelcomeMessage>
        <p>This is passed as children!</p>
      </WelcomeMessage>
    </div>
  );
}

// Child component receiving props
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Using object destructuring for cleaner code
function UserInfo({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>Age: {user.age}</p>
      <p>Student: {user.isStudent ? 'Yes' : 'No'}</p>
    </div>
  );
}

// Using children prop
function WelcomeMessage({ children }) {
  return (
    <div className="welcome-box">
      {children}
    </div>
  );
}`,
                    resources: [
                      { name: "Props Documentation", type: "article", url: "#" }
                    ]
                  },
                  {
                    id: "t5",
                    title: "Props Drilling vs Composition",
                    duration: "25 min",
                    type: "reading",
                    completed: false,
                    introduction: "As your app grows, you might need to pass data through many layers of components. This is called 'props drilling'. React offers composition patterns to avoid this.",
                    content: [
                      "Props drilling occurs when you pass props through intermediate components that don't need the data, just to reach deeper components.",
                      "While props drilling is simple and works for small apps, it can become messy as your app grows.",
                      "Composition is a better approach - instead of passing props through every level, you compose components differently."
                    ],
                    keyPoints: [
                      "Props drilling: Passing data through multiple layers",
                      "Composition: Restructuring components to avoid unnecessary prop passing",
                      "Children prop can help with composition",
                      "For complex apps, consider Context API or state management"
                    ],
                    codeExamples: `// Props Drilling Example (Avoid)
function App() {
  const [user, setUser] = useState({ name: 'John' });
  return <Dashboard user={user} />;
}

function Dashboard({ user }) {
  return <Sidebar user={user} />;  // Just passing through
}

function Sidebar({ user }) {
  return <Profile user={user} />;  // Still passing through
}

function Profile({ user }) {
  return <h1>{user.name}</h1>;  // Finally using it
}

// Better Approach - Composition
function App() {
  const [user, setUser] = useState({ name: 'John' });
  return (
    <Dashboard>
      <Sidebar>
        <Profile user={user} />
      </Sidebar>
    </Dashboard>
  );
}

function Dashboard({ children }) {
  return <div className="dashboard">{children}</div>;
}

function Sidebar({ children }) {
  return <div className="sidebar">{children}</div>;
}

function Profile({ user }) {
  return <h1>{user.name}</h1>;
}`,
                    resources: [
                      { name: "Composition vs Inheritance", type: "article", url: "#" }
                    ]
                  }
                ]
              },
              {
                id: "s3",
                title: "State & Lifecycle",
                duration: "4 hours",
                topics: [
                  {
                    id: "t6",
                    title: "useState Hook",
                    duration: "25 min",
                    type: "reading",
                    completed: false,
                    introduction: "The useState hook is the most basic hook in React. It allows functional components to have state variables.",
                    content: [
                      "useState returns an array with two elements: the current state value and a function to update it.",
                      "You can use multiple useState calls in a single component for different pieces of state.",
                      "When state updates, the component re-renders with the new value."
                    ],
                    keyPoints: [
                      "useState is a hook (function starting with 'use')",
                      "Returns [state, setState] array",
                      "Call useState at the top level of your component",
                      "State updates trigger re-renders"
                    ],
                    codeExamples: `import { useState } from 'react';

function Counter() {
  // Declare a state variable 'count' with initial value 0
  const [count, setCount] = useState(0);
  
  // Multiple state variables
  const [name, setName] = useState('John');
  const [age, setAge] = useState(25);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      
      <div>
        <p>Name: {name}, Age: {age}</p>
        <button onClick={() => setName('Jane')}>
          Change Name
        </button>
      </div>
    </div>
  );
}`,
                    resources: [
                      { name: "useState Documentation", type: "article", url: "#" }
                    ]
                  },
                  {
                    id: "t7",
                    title: "useEffect Hook",
                    duration: "30 min",
                    type: "reading",
                    completed: false,
                    introduction: "The useEffect hook lets you perform side effects in functional components. It runs after every render by default.",
                    content: [
                      "Side effects include: data fetching, subscriptions, DOM manipulation, timers, and logging.",
                      "useEffect takes two arguments: a function and an optional dependency array.",
                      "The function runs after the render. You can return a cleanup function that runs before the next effect."
                    ],
                    keyPoints: [
                      "useEffect runs after render by default",
                      "Dependency array controls when the effect runs",
                      "Empty array [] means effect runs only once (on mount)",
                      "Return a cleanup function to prevent memory leaks"
                    ],
                    codeExamples: `import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  // Effect that runs on every render
  useEffect(() => {
    console.log('Component rendered');
  });
  
  // Effect that runs only once (on mount)
  useEffect(() => {
    console.log('Component mounted');
    
    // Cleanup function (runs on unmount)
    return () => {
      console.log('Component will unmount');
    };
  }, []);
  
  // Effect with dependencies
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // Cleanup interval
    return () => clearInterval(timer);
  }, []); // Empty dependency = runs once
  
  // Effect that runs when seconds changes
  useEffect(() => {
    if (seconds > 0 && seconds % 10 === 0) {
      console.log(\`\${seconds} seconds passed\`);
    }
  }, [seconds]);
  
  return <div>Timer: {seconds}s</div>;
}`,
                    resources: [
                      { name: "useEffect Documentation", type: "article", url: "#" }
                    ]
                  }
                ]
              }
            ]
          },
          requirements: [
            "Basic HTML and CSS knowledge",
            "JavaScript fundamentals (variables, functions, arrays)",
            "Basic understanding of ES6 features (optional)"
          ],
          whatYouLearn: [
            "Build complete React applications from scratch",
            "Master components, props, and state management",
            "Implement hooks (useState, useEffect, useContext)",
            "Handle forms, routing, and API calls",
            "Manage global state with Context API and Redux",
            "Optimize performance of React apps",
            "Deploy React applications to production",
            "Write clean, maintainable React code"
          ]
        },
        "2": {
          id: "2",
          title: "Core Java and Advanced Java",
          subtitle: "Complete Java Masterclass from Basics to Enterprise Applications",
          description: "Java is a widely used programming language with two main parts: Core Java also known as Standard Edition and Advanced Java also known as Enterprise Edition.",
          detailedDescription: `Core Java is the part of Java programming language that is used for creating or developing a general-purpose application. Advanced Java is also a part of Java programming language that generally deals with online application like the website and mobile application.
          
This course compares core Java vs advanced Java, discussing their advantages and uses with a helpful table. It explains why learning both is crucial for a comprehensive skill set in software development, benefiting both beginners and experienced developers.`,
          category: "Programming",
          instructor: {
            name: "Jane Smith",
            id: "2",
            avatar: "https://picsum.photos/100?random=2",
            title: "Senior Java Developer at Google",
            bio: "10+ years of experience in Java development. Previously worked at Oracle on Java SE team.",
            rating: 4.8,
            students: 5000,
            courses: 8,
            expertise: ["Java", "Spring", "Hibernate", "Microservices"]
          },
          stats: {
            totalStudents: 5000,
            totalRatings: 1200,
            totalHours: 45,
            totalArticles: 60,
            totalResources: 75,
            language: "English",
            subtitles: "English",
            lastUpdated: "February 2026"
          },
          chaptersCount: 25,
          rating: 4.8,
          students: 5000,
          price: 49,
          discountedPrice: 39,
          imageUrl: "https://picsum.photos/800/400?random=2",
          thumbnail: "https://picsum.photos/400/200?random=2",
          difficulty: "Intermediate",
          language: "English",
          certificate: true,
          content: {
            sections: [
              {
                id: "s1",
                title: "Core Java (Standard Edition)",
                duration: "4 hours",
                topics: [
                  {
                    id: "t1",
                    title: "Java Introduction",
                    duration: "15 min",
                    type: "reading",
                    completed: false,
                    introduction: "Java is a high-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible.",
                    content: [
                      "Java was developed by James Gosling at Sun Microsystems and released in 1995.",
                      "It follows the principle 'Write Once, Run Anywhere' (WORA) meaning compiled Java code can run on all platforms that support Java without recompilation.",
                      "Java is used for web applications, mobile apps (Android), enterprise software, and more."
                    ],
                    keyPoints: [
                      "Object-oriented programming language",
                      "Platform independent (JVM)",
                      "Automatic memory management (Garbage Collection)",
                      "Rich API and libraries",
                      "Strong type checking"
                    ]
                  }
                ]
              }
            ]
          }
        }
      };

      const selectedCourse = coursesData[id] || coursesData["1"];
      setCourse(selectedCourse);
      
      // Check if user is enrolled in this course
      if (isLoggedIn) {
        const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
        setIsEnrolled(enrolledCourses.includes(id));
        
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setIsInCart(cart.includes(id));
      }
      
      setLoading(false);
    }, 500);
  }, [id, isLoggedIn]);

  // Handle enrollment
  const handleEnroll = () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    
    if (!enrolledCourses.includes(id)) {
      enrolledCourses.push(id);
      localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
      setIsEnrolled(true);
      
      if (currentUser) {
        const updatedUser = { ...currentUser };
        if (!updatedUser.enrolledCourses) {
          updatedUser.enrolledCourses = [];
        }
        if (!updatedUser.enrolledCourses.includes(parseInt(id))) {
          updatedUser.enrolledCourses.push(parseInt(id));
          localStorage.setItem("user", JSON.stringify(updatedUser));
          localStorage.setItem("student", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      }
      
      alert("Successfully enrolled in the course!");
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    if (!cart.includes(id)) {
      cart.push(id);
      localStorage.setItem("cart", JSON.stringify(cart));
      setIsInCart(true);
      alert("Course added to cart!");
    }
  };

  // Handle continue learning
  const handleContinueLearning = () => {
    navigate(`/course/${id}/learn`);
  };

  const tabs = ["Overview", "Course Content", "Instructor", "Reviews"];

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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Course Header Component */}
      <CourseHeader 
        course={course}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
        onAddToCart={handleAddToCart}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Tabs */}
        <div className="flex border-b mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 sm:px-6 py-3 font-medium text-sm sm:text-base transition whitespace-nowrap ${
                activeTab === tab.toLowerCase()
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Description */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-700 text-sm sm:text-base mb-4">{course.description}</p>
                  {course.detailedDescription && (
                    <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line">{course.detailedDescription}</p>
                  )}
                </div>

                {/* What you'll learn */}
                {course.whatYouLearn && (
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">What you'll learn</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {course.whatYouLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {course.requirements && (
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">Requirements</h2>
                    <ul className="list-disc list-inside space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="text-gray-700 text-sm sm:text-base">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "course content" && (
              <CourseContent 
                content={course.content}
                isEnrolled={isEnrolled}
                onTopicClick={(topicId) => console.log("Topic clicked:", topicId)}
              />
            )}

            {activeTab === "instructor" && (
              <CourseInstructor instructor={course.instructor} />
            )}

            {activeTab === "reviews" && (
              <CourseReview courseId={course.id} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">This course includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <PlayCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>{course.stats?.totalHours || course.chaptersCount} hours on-demand video</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>{course.stats?.totalArticles || 50} articles</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>Downloadable resources</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>Full lifetime access</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>Access on mobile and TV</span>
                </li>
                {course.certificate && (
                  <li className="flex items-center gap-2 text-sm">
                    <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Certificate of completion</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Student Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Student feedback</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-900">{course.rating}</div>
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(course.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {course.stats?.totalRatings || course.students} ratings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;