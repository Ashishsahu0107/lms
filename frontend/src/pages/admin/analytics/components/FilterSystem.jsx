import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  BookOpen,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { getCourses, getTeachers } from "../../../../services/adminService";

export default function FilterSystem({ onFilterChange }) {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDate, setSelectedDate] = useState("30");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const courseRes = await getCourses();
        if (courseRes && courseRes.success) {
          // Check if data is array or wrapped
          const dataList = Array.isArray(courseRes.data)
            ? courseRes.data
            : courseRes.data?.courses || [];
          setCourses(dataList);
        }

        const teacherRes = await getTeachers();
        if (teacherRes && teacherRes.success) {
          const teacherList = Array.isArray(teacherRes.data)
            ? teacherRes.data
            : teacherRes.data?.teachers || [];
          setTeachers(teacherList);
        }
      } catch (err) {
        console.error("Failed to load filter configurations:", err);
      }
    }
    loadFilterOptions();
  }, []);

  const handleApply = () => {
    // Calculate dates
    let startDate = "";
    let endDate = new Date().toISOString();

    if (selectedDate !== "all") {
      const days = parseInt(selectedDate);
      const start = new Date();
      start.setDate(start.getDate() - days);
      startDate = start.toISOString();
    }

    onFilterChange({
      startDate,
      endDate,
      courseId: selectedCourse,
      teacherId: selectedTeacher,
      studentSearch,
    });
  };

  // Auto apply on change
  useEffect(() => {
    handleApply();
  }, [selectedDate, selectedCourse, selectedTeacher]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search student or email..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        {/* Primary Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Date Selector */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5">
            <Calendar className="h-4 w-4 text-white/50" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="7" className="bg-neutral-900 text-white">
                Last 7 Days
              </option>
              <option value="30" className="bg-neutral-900 text-white">
                Last 30 Days
              </option>
              <option value="90" className="bg-neutral-900 text-white">
                Last 90 Days
              </option>
              <option value="365" className="bg-neutral-900 text-white">
                Last 1 Year
              </option>
              <option value="all" className="bg-neutral-900 text-white">
                Lifetime
              </option>
            </select>
          </div>

          {/* Toggle Advanced */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              showAdvanced
                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                : "bg-black/20 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4 animate-fadeIn">
          {/* Course filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" /> Course Filter
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                  className="bg-neutral-900"
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Teacher Owner
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">All Teachers</option>
              {teachers.map((teacher) => (
                <option
                  key={teacher._id}
                  value={teacher._id}
                  className="bg-neutral-900"
                >
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
