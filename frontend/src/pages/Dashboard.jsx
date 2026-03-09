import { BookOpen, Users, DollarSign } from "lucide-react"

const Dashboard = () => {

  const stats = [
    {
      title: "Total Courses",
      value: "24",
      icon: <BookOpen size={28} />,
      color: "bg-blue-500"
    },
    {
      title: "Total Students",
      value: "3,240",
      icon: <Users size={28} />,
      color: "bg-green-500"
    },
    {
      title: "Revenue",
      value: "$12,430",
      icon: <DollarSign size={28} />,
      color: "bg-purple-500"
    }
  ]

  const courses = [
    {
      id: 1,
      name: "React for Beginners",
      students: 320,
      price: "$49"
    },
    {
      id: 2,
      name: "Java Programming",
      students: 210,
      price: "$39"
    },
    {
      id: 3,
      name: "Python for Data Science",
      students: 500,
      price: "$59"
    }
  ]

  return (

    <div className="p-6 max-w-7xl mx-auto">

      {/* Title */}

      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>


      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">

        {stats.map((stat, index) => (

          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between hover:shadow-lg transition"
          >

            <div>

              <p className="text-gray-500 text-sm">
                {stat.title}
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {stat.value}
              </h2>

            </div>

            <div
              className={`${stat.color} text-white p-3 rounded-lg`}
            >
              {stat.icon}
            </div>

          </div>

        ))}

      </div>


      {/* Courses Table */}

      <div className="bg-white rounded-xl shadow-md p-6">

        <h2 className="text-xl font-semibold mb-4">
          Recent Courses
        </h2>

        <table className="w-full text-left">

          <thead>

            <tr className="border-b">

              <th className="py-2">Course</th>
              <th className="py-2">Students</th>
              <th className="py-2">Price</th>

            </tr>

          </thead>

          <tbody>

            {courses.map((course) => (

              <tr key={course.id} className="border-b hover:bg-gray-50">

                <td className="py-3">
                  {course.name}
                </td>

                <td>
                  {course.students}
                </td>

                <td>
                  {course.price}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default Dashboard