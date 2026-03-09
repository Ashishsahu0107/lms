import { Routes, Route, Navigate } from "react-router-dom"

import Layout from "./components/Layout"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Courses from "./pages/Courses"

import AssignmentsPage from "./components/AssignmentsPage"
import AttendancePage from "./components/AttendancePage"
import QuizzesPage from "./components/QuizzesPage"
import QuizTakePage from "./components/QuizTakePage"
import LearningSupportPage from "./components/LearningSupportPage"

function App(){

  const isAuth = localStorage.getItem("student")

  return (

    <Routes>

      <Route path="/" element={<Login/>} />

      <Route path="/signup" element={<Signup/>} />

      <Route element={isAuth ? <Layout/> : <Navigate to="/" />}>

        <Route path="/home" element={<Home/>} />

        <Route path="/dashboard" element={<Dashboard/>} />

        <Route path="/courses" element={<Courses/>} />

        <Route path="/assignments" element={<AssignmentsPage/>} />

        <Route path="/attendance" element={<AttendancePage/>} />

        <Route path="/quizzes" element={<QuizzesPage/>} />

        <Route path="/quiz/:id" element={<QuizTakePage/>} />

        <Route path="/support" element={<LearningSupportPage/>} />

      </Route>

    </Routes>

  )

}

export default App