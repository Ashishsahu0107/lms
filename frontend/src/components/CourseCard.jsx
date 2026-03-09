import { Link } from "react-router-dom"
import { Star } from "lucide-react"
import InstructorDialog from "./InstructorDialog"

const formatPrice = (price) => {
  if (price === 0) return "Free"
  return `$${price}`
}

const CourseCard = ({
  id,
  instructor,
  instructorId,
  title,
  category,
  chaptersCount,
  price,
  rating,
  students,
  imageUrl,
}) => {

  return (

    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1">

      {/* Course Image */}

      <Link to={`/course/${id}`}>

        <div className="relative">

          <img
            src={imageUrl}
            alt={title}
            className="w-full h-44 object-cover"
          />

          {/* Category badge */}

          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {category}
          </span>

        </div>

      </Link>


      {/* Content */}

      <div className="p-4">

        <Link to={`/course/${id}`}>

          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 hover:text-blue-600 transition">
            {title}
          </h3>

        </Link>


        {/* Instructor */}

        <p className="text-sm text-gray-500 mt-2">

          by{" "}

          <InstructorDialog
            instructorId={instructorId}
            instructorName={instructor}
            triggerElement={
              <span className="text-blue-600 hover:underline cursor-pointer">
                {instructor}
              </span>
            }
          />

        </p>


        {/* Rating */}

        <div className="flex items-center gap-1 mt-2 text-sm">

          <Star size={16} className="text-yellow-500 fill-yellow-500" />

          <span className="font-medium">
            {rating}
          </span>

          <span className="text-gray-400">
            ({students} students)
          </span>

        </div>


        {/* Bottom */}

        <div className="flex justify-between items-center mt-4">

          <span className="text-xs text-gray-500">
            {chaptersCount} chapters
          </span>

          <span className={`font-bold ${
            price === 0
              ? "text-green-600"
              : "text-blue-600"
          }`}>
            {formatPrice(price)}
          </span>

        </div>


        {/* Button */}

        <Link
          to={`/course/${id}`}
          className="block text-center mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Course
        </Link>

      </div>

    </div>

  )

}

export default CourseCard