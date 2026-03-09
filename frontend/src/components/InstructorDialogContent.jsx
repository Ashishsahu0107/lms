import { Link } from "react-router-dom"

const formatPrice = (price) => {
  return `$${price}`
}

const InstructorDialogContent = ({ instructorDetails, isLoading }) => {

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        Loading...
      </div>
    )
  }

  if (!instructorDetails) {
    return (
      <p className="text-center text-gray-500 py-4">
        Failed to load instructor information
      </p>
    )
  }

  return (
    <div className="space-y-4">

      {/* Instructor info */}

      <div className="flex items-center space-x-4">

        <img
          src={
            instructorDetails.imageUrl ||
            "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg"
          }
          alt={instructorDetails.name}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div>
          <h3 className="text-lg font-semibold">
            {instructorDetails.name}
          </h3>

          <p className="text-sm text-gray-600">
            {instructorDetails.email}
          </p>
        </div>

      </div>


      {/* Stats */}

      <div className="grid grid-cols-2 gap-4 mt-4">

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Courses</p>
          <p className="text-xl font-semibold">
            {instructorDetails.totalCourses}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-xl font-semibold">
            {instructorDetails.totalStudents}
          </p>
        </div>

      </div>


      {/* Featured Courses */}

      {instructorDetails.featuredCourses &&
        instructorDetails.featuredCourses.length > 0 && (

        <div className="mt-4">

          <h4 className="font-semibold mb-2">
            Featured Courses
          </h4>

          <div className="space-y-2">

            {instructorDetails.featuredCourses.map((course) => (

              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
              >

                <img
                  src={
                    course.imageUrl ||
                    "https://img.freepik.com/premium-vector/print_1126632-1359.jpg"
                  }
                  alt={course.title}
                  className="w-16 h-12 object-cover rounded"
                />

                <div className="flex-1">

                  <p className="text-sm font-medium">
                    {course.title}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {course.enrolledCount} students • {formatPrice(course.price)}
                  </p>

                </div>

              </Link>

            ))}

          </div>

        </div>

      )}

    </div>
  )
}

export default InstructorDialogContent