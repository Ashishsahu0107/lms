import { ArrowDown } from "lucide-react"
import Search from "./Search"

const HeroSection = () => {

  const handleScroll = () => {

    window.scrollBy({
      top: window.innerHeight * 0.6,
      behavior: "smooth",
    })

  }

  return (

    <section className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-center py-20">

      <h1 className="text-5xl font-bold">
        Find the Best Courses
      </h1>

      <p className="mt-4 text-lg opacity-90">
        Learn new skills and boost your career
      </p>

      <div className="flex justify-center mt-8">
        <Search placeholder="Search courses..." />
      </div>

      <button
        onClick={handleScroll}
        className="mt-8 flex items-center gap-2 mx-auto bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
      >
        Explore Courses
        <ArrowDown size={18} />
      </button>

    </section>

  )
}

export default HeroSection