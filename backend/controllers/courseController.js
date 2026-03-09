export const getCourses = (req, res) => {
  const courses = [
    {
      id: 1,
      title: "React Course"
    },
    {
      id: 2,
      title: "Java Programming"
    }
  ];

  res.json(courses);
};