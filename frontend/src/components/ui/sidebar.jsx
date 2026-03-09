import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  HelpCircle,
  ClipboardList
} from "lucide-react"

const Sidebar = () => {

  const location = useLocation()

  const menu = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/dashboard"
    },
    {
      name: "Courses",
      icon: <BookOpen size={18} />,
      path: "/courses"
    },
    {
      name: "Assignments",
      icon: <FileText size={18} />,
      path: "/assignments"
    },
    {
      name: "Quizzes",
      icon: <ClipboardList size={18} />,
      path: "/quizzes"
    },
    {
      name: "Attendance",
      icon: <Calendar size={18} />,
      path: "/attendance"
    },
    {
      name: "Learning Support",
      icon: <HelpCircle size={18} />,
      path: "/support"
    }
  ]

  return (

    <aside className="w-64 h-screen bg-white border-r p-5">

      <h2 className="text-xl font-bold mb-6 text-blue-600">
        HustLMS
      </h2>

      <nav className="flex flex-col gap-3">

        {menu.map((item,index) => (

          <Link
            key={index}
            to={item.path}
            className={`flex items-center gap-3 p-2 rounded-lg transition
            ${
              location.pathname === item.path
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100"
            }`}
          >

            {item.icon}

            {item.name}

          </Link>

        ))}

      </nav>

    </aside>

  )

}

export default Sidebar