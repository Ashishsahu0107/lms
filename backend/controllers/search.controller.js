import { Course } from "../models/Course.js";
import { Quiz } from "../models/Quiz.js";
import { Assignment } from "../models/Assignment.js";
import { User } from "../models/User.js";
import { BadRequestError } from "../utils/errors.js";

// ============================================
// GET /api/search/global
// Search across Courses, Quizzes, Assignments, and Users (depending on role)
// ============================================
export async function globalSearch(req, res, next) {
  try {
    const { query = "" } = req.query;

    if (!query || query.trim() === "") {
      return res.status(200).json({
        success: true,
        data: {
          courses: [],
          quizzes: [],
          assignments: [],
          users: [],
        },
      });
    }

    const cleanQuery = query.trim();
    const regex = new RegExp(cleanQuery, "i");

    // 1. Search Courses
    const courses = await Course.find({
      $or: [{ title: regex }, { description: regex }],
    })
      .limit(10)
      .select("title description banner image price");

    // 2. Search Quizzes
    const quizzes = await Quiz.find({ title: regex })
      .limit(10)
      .select("title description status duration");

    // 3. Search Assignments
    const assignments = await Assignment.find({ title: regex })
      .limit(10)
      .select("title description dueDate status");

    // 4. Search Users (Only accessible for Teachers and Admins)
    let users = [];
    if (req.user.role === "super_admin" || req.user.role === "teacher") {
      users = await User.find({
        $or: [{ name: regex }, { email: regex }],
      })
        .limit(10)
        .select("name email role avatar");
    }

    return res.status(200).json({
      success: true,
      data: {
        courses,
        quizzes,
        assignments,
        users,
      },
    });
  } catch (err) {
    next(err);
  }
}
