import { useState } from "react"
import InstructorDialogContent from "./InstructorDialogContent"

const InstructorDialog = ({
  instructorId,
  instructorName,
  triggerElement
}) => {

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [instructorDetails, setInstructorDetails] = useState(null)

  const openDialog = () => {

    setOpen(true)
    setLoading(true)

    // Fake data since backend removed
    setTimeout(() => {

      setInstructorDetails({
        id: instructorId,
        name: instructorName,
        email: "instructor@example.com",
        imageUrl: "",
        totalCourses: 5,
        totalStudents: 120,
        featuredCourses: [
          {
            id: "1",
            title: "React for Beginners",
            price: 49,
            enrolledCount: 300,
            imageUrl: ""
          },
          {
            id: "2",
            title: "Java Programming",
            price: 39,
            enrolledCount: 200,
            imageUrl: ""
          }
        ]
      })

      setLoading(false)

    }, 800)

  }

  const closeDialog = () => {
    setOpen(false)
  }

  return (
    <>
      <span onClick={openDialog}>
        {triggerElement}
      </span>

      {open && (

        <div
          style={{
            position:"fixed",
            top:0,
            left:0,
            width:"100%",
            height:"100%",
            background:"rgba(0,0,0,0.5)",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            zIndex:1000
          }}
        >

          <div
            style={{
              background:"white",
              padding:"20px",
              borderRadius:"8px",
              width:"400px",
              maxHeight:"80vh",
              overflow:"auto"
            }}
          >

            <div style={{display:"flex", justifyContent:"space-between"}}>
              <h2>Instructor Details</h2>

              <button onClick={closeDialog}>
                ✕
              </button>
            </div>

            <InstructorDialogContent
              instructorDetails={instructorDetails}
              isLoading={loading}
            />

          </div>

        </div>

      )}
    </>
  )
}

export default InstructorDialog