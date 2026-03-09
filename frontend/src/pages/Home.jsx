import HeroSection from "../components/HeroSection"
import CardList from "../components/CardList"

const Home = () => {

  const courses = [
    {
      id: "1",
      title: "React for Beginners",
      category: "Web Development",
      instructor: "John Doe",
      instructorId: "1",
      chaptersCount: 12,
      price: 49,
      rating: 4.8,
      students: 1200,
      imageUrl: "https://picsum.photos/400"
    },
    {
      id: "2",
      title: "Java Programming Masterclass",
      category: "Programming",
      instructor: "Jane Smith",
      instructorId: "2",
      chaptersCount: 18,
      price: 39,
      rating: 4.6,
      students: 900,
      imageUrl: "https://picsum.photos/401"
    },
    {
      id: "3",
      title: "Python for Data Science",
      category: "Data Science",
      instructor: "Alex Brown",
      instructorId: "3",
      chaptersCount: 20,
      price: 59,
      rating: 4.9,
      students: 1500,
      imageUrl: "https://picsum.photos/402"
    }
  ]

  return (
    <div>

      <HeroSection />

      <div className="max-w-7xl mx-auto px-6 mt-12">

        <h2 className="text-3xl font-bold mb-6">
          Popular Courses
        </h2>

        <CardList
          courses={courses}
          title="Popular Courses"
        />

      </div>

    </div>
  )
}

export default Home