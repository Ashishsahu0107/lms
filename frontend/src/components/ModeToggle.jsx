import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

const ModeToggle = () => {

  const [dark, setDark] = useState(false)

  useEffect(() => {

    const theme = localStorage.getItem("theme")

    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      setDark(true)
    }

  }, [])

  const toggleTheme = () => {

    if (dark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setDark(true)
    }

  }

  return (

    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >

      {dark ? <Sun size={18}/> : <Moon size={18}/>}

    </button>

  )
}

export default ModeToggle