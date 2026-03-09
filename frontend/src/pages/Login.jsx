import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Login() {

  const navigate = useNavigate()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleLogin = (e) => {

    e.preventDefault()

    // fake login
    localStorage.setItem("student","true")

    navigate("/dashboard")

  }

  return (

    <div className="flex items-center justify-center h-screen bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-[350px]"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Student Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>

      </form>

    </div>

  )

}