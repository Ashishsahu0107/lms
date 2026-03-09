import { useNavigate } from "react-router-dom"
import { useState } from "react"

const Signup = () => {

  const navigate = useNavigate()

  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")

  const handleSignup=(e)=>{

    e.preventDefault()

    localStorage.setItem("student",email)

    navigate("/")

  }

  return(

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Student Signup
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border mb-4 rounded"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border mb-4 rounded"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white p-3 rounded">
          Create Account
        </button>

      </form>

    </div>

  )

}

export default Signup