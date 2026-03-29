import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Users, Clock, TrendingUp } from 'lucide-react';
import { courseService } from '../utils/apiService';
import { useAuth } from '../hooks/useAuth';

const Courses = () => {
  const navigate = useNavigate();
  const { enrolledCourses } = useAuth();
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'React for Beginners',
      description: 'Master React from scratch',
      category: 'Web Development',
      instructor: 'John Doe',
      students: 12500,
      rating: 4.8,
      duration: 42,
      price: 0,
      level: 'Beginner',
      image: 'https://picsum.photos/300/200?random=1',
    },
    {
      id: 2,
      title: 'Core Java Masterclass',
      description: 'Complete Java course from basics to advanced',
      category: 'Programming',
      instructor: 'Jane Smith',
      students: 5000,
      rating: 4.7,
      duration: 45,
      price: 0,
      level: 'Intermediate',
      image: 'https://picsum.photos/300/200?random=2',
    },
    {
      id: 3,
      title: 'Python for Data Science',
      description: 'Learn Python for data analysis and ML',
      category: 'Data Science',
      instructor: 'Alex Brown',
      students: 1500,
      rating: 4.9,
      duration: 40,
      price: 0,
      level: 'Intermediate',
      image: 'https://picsum.photos/300/200?random=3',
    },
    {
      id: 4,
      title: 'Web Design Essentials',
      description: 'Design beautiful and responsive websites',
      category: 'Design',
      instructor: 'Sarah Wilson',
      students: 3200,
      rating: 4.6,
      duration: 35,
      price: 0,
      level: 'Beginner',
      image: 'https://picsum.photos/300/200?random=4',
    },
  ]);

  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const categories = ['All', 'Web Development', 'Programming', 'Data Science', 'Design'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filterCourses = (query, category, level) => {
    let filtered = courses;

    // Search filter
    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Category filter
    if (category !== 'All') {
      filtered = filtered.filter((c) => c.category === category);
    }

    // Level filter
    if (level !== 'All') {
      filtered = filtered.filter((c) => c.level === level);
    }

    setFilteredCourses(filtered);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterCourses(query, selectedCategory, selectedLevel);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterCourses(searchQuery, category, selectedLevel);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    filterCourses(searchQuery, selectedCategory, level);
  };

  const isEnrolled = (courseId) =>
    enrolledCourses?.some((c) => c.id === courseId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore Courses
          </h1>
          <p className="text-xl text-gray-600">
            Choose from {courses.length} world-class courses
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                <Filter className="w-5 h-5" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-2 rounded-full font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                <TrendingUp className="w-5 h-5" />
                Level
              </label>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level)}
                    className={`px-4 py-2 rounded-full font-medium transition ${
                      selectedLevel === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredCourses.length > 0 ? (
          <div>
            <p className="text-gray-600 mb-6">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const enrolled = isEnrolled(course.id);

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden bg-gray-200 h-40">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {enrolled && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Enrolled
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {course.category}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {course.level}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <p className="text-sm text-gray-700 font-medium mb-3">
                        by {course.instructor}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.students.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {course.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}h
                        </div>
                      </div>

                      {/* Price Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/course/${course.id}`);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                        >
                          {enrolled ? 'View' : 'Enroll'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">
              No courses found matching your criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
