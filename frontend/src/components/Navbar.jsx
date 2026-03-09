import { useNavigate } from "react-router-dom"

const Navbar = () => {

  const navigate = useNavigate()

  const logout = () => {

    localStorage.removeItem("student")

    navigate("/")

  }

  return (

    <div className="flex justify-between items-center p-4 shadow">

      <h1 className="text-xl font-bold text-blue-600">
        HustLMS
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        Logout
      </button>

    </div>

  )

}

export default Navbar