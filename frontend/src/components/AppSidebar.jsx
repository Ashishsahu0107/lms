import { Link } from "react-router-dom"

export default function AppSidebar(){

  return(

    <aside className="w-64 h-screen border-r p-5">

      <h2 className="text-xl font-bold mb-6 text-blue-600">
        <Link to="/home">HustLMS</Link>
      </h2>

      <nav className="flex flex-col gap-4">

        <Link to="/dashboard">Dashboard</Link>

        <Link to="/courses">Courses</Link>

        <Link to="/assignments">Assignments</Link>

        <Link to="/quizzes">Quizzes</Link>

        <Link to="/attendance">Attendance</Link>

        <Link to="/support">Learning Support</Link>

      </nav>

    </aside>

  )

}