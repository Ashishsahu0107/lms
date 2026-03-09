import { useState } from "react"
import CourseCard from "../components/CourseCard"

const Courses = () => {

  const [category, setCategory] = useState("All")

  const courses = [
    {
      id: "1",
      title: "React for Beginners",
      category: "Web",
      instructor: "John Doe",
      instructorId: "1",
      chaptersCount: 15,
      rating: 4.8,
      students: 1200,
      price: 49,
      imageUrl: "https://picsum.photos/400"
    },
    {
      id: "2",
      title: "Java Programming",
      category: "Programming",
      instructor: "Jane Smith",
      instructorId: "2",
      chaptersCount: 20,
      rating: 4.6,
      students: 800,
      price: 39,
      imageUrl: "https://picsum.photos/401"
    },
    {
      id: "3",
      title: "Python for Data Science",
      category: "Data",
      instructor: "Alex Brown",
      instructorId: "3",
      chaptersCount: 18,
      rating: 4.9,
      students: 1500,
      price: 59,
      imageUrl: "https://picsum.photos/402"
    },
    {
      id: "4",
      title: "UI UX Design Masterclass",
      category: "Design",
      instructor: "Emily Stone",
      instructorId: "4",
      chaptersCount: 12,
      rating: 4.7,
      students: 600,
      price: 29,
      imageUrl: "https://picsum.photos/403"
    }
  ]

  const categories = ["All", "Web", "Programming", "Data", "Design"]

  const filteredCourses =
    category === "All"
      ? courses
      : courses.filter((c) => c.category === category)

  return (

    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Title */}

      <h1 className="text-4xl font-bold mb-8">
        Explore Courses
      </h1>


      {/* Category Filter */}

      <div className="flex gap-3 flex-wrap mb-8">

        {categories.map((cat) => (

          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full border transition
              ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            {cat}
          </button>

        ))}

      </div>


      {/* Courses Grid */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {filteredCourses.map((course) => (

          <CourseCard
            key={course.id}
            {...course}
          />

        ))}

      </div>

    </div>

  )

}

export default Courses