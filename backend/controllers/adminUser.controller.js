import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";
import { Quiz } from "../models/Quiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Attendance } from "../models/Attendance.js";
import { Activity } from "../models/Activity.js";
import { Performance } from "../models/Performance.js";
import bcrypt from "bcryptjs";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

// =====================================
// TEACHER OPERATIONS
// =====================================

// Create Teacher
export async function createTeacherController(req, res, next) {
  try {
    const {
      name,
      email,
      password = "teacher123",
      phone,
      bio,
      avatar,
      qualification,
      specialization,
      experience,
      assignedCourses = [],
    } = req.body ?? {};

    if (!name || !email) {
      throw new BadRequestError(
        "Name and email are required for teacher accounts.",
      );
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new BadRequestError(
        "A user with this email address already exists.",
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newTeacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      phone,
      bio,
      avatar,
      qualification,
      specialization,
      experience,
      assignedCourses,
      teachingCourses: assignedCourses,
      isActive: true,
      status: "active",
    });

    // Write audit activity log
    await Activity.create({
      userId: req.user._id,
      action: "CREATE_TEACHER",
      details: `Created teacher account for ${name} (${email})`,
      ip: req.ip || "127.0.0.1",
    });

    return res.status(201).json({
      success: true,
      message: "Teacher account created successfully.",
      data: newTeacher,
    });
  } catch (err) {
    next(err);
  }
}

// List Teachers
export async function getTeachersController(req, res, next) {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const query = { role: "teacher" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const [teachers, total] = await Promise.all([
      User.find(query)
        .skip(skipCount)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    // Enrich with dynamic course counts and total enrolled students counts
    const enrichedTeachers = await Promise.all(
      teachers.map(async (t) => {
        const courses = await Course.find({ teacherId: t._id }).select(
          "_id students",
        );
        const studentCount = courses.reduce(
          (acc, c) => acc + (c.students?.length || 0),
          0,
        );
        return {
          ...t.toObject(),
          coursesCount: courses.length,
          studentsCount: studentCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        teachers: enrichedTeachers,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Get Single Teacher
export async function getTeacherByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ _id: id, role: "teacher" });
    if (!teacher) {
      throw new NotFoundError("Teacher account not found.");
    }

    // Populate active courses taught
    const courses = await Course.find({ teacherId: teacher._id })
      .select("title price category students averageRating difficulty")
      .populate("students", "name email");

    // Submissions review auditing
    const courseIds = courses.map((c) => c._id);
    const [totalStudents, pendingReviews, assignmentsCount, quizzesCount] =
      await Promise.all([
        Enrollment.countDocuments({ courseId: { $in: courseIds } }),
        Submission.countDocuments({
          assignmentId: {
            $in: await Assignment.distinct("_id", {
              courseId: { $in: courseIds },
            }),
          },
          status: "pending",
        }),
        Assignment.countDocuments({ courseId: { $in: courseIds } }),
        Quiz.countDocuments({ courseId: { $in: courseIds } }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        teacher,
        courses,
        stats: {
          totalStudents,
          pendingReviews,
          assignmentsCount,
          quizzesCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// Update Teacher
export async function updateTeacherController(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      bio,
      avatar,
      qualification,
      specialization,
      experience,
      assignedCourses,
      status,
    } = req.body ?? {};

    const teacher = await User.findOne({ _id: id, role: "teacher" });
    if (!teacher) {
      throw new NotFoundError("Teacher account not found.");
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone !== undefined) teacher.phone = phone;
    if (bio !== undefined) teacher.bio = bio;
    if (avatar !== undefined) teacher.avatar = avatar;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (specialization !== undefined) teacher.specialization = specialization;
    if (experience !== undefined) teacher.experience = experience;
    if (status) {
      teacher.status = status;
      teacher.isActive = status === "active";
    }
    if (assignedCourses) {
      teacher.assignedCourses = assignedCourses;
      teacher.teachingCourses = assignedCourses;

      // Update course assigned teachers in the Course database as well
      await Course.updateMany(
        { _id: { $in: assignedCourses } },
        { $set: { teacherId: teacher._id } },
      );
    }

    await teacher.save();

    await Activity.create({
      userId: req.user._id,
      action: "UPDATE_TEACHER",
      details: `Updated teacher details for ${teacher.name}`,
      ip: req.ip || "127.0.0.1",
    });

    return res.status(200).json({
      success: true,
      message: "Teacher account updated successfully.",
      data: teacher,
    });
  } catch (err) {
    next(err);
  }
}

// Delete Teacher
export async function deleteTeacherController(req, res, next) {
  try {
    const { id } = req.params;

    const teacher = await User.findOneAndDelete({ _id: id, role: "teacher" });
    if (!teacher) {
      throw new NotFoundError("Teacher account not found.");
    }

    // Clean course teacherId references
    await Course.updateMany(
      { teacherId: teacher._id },
      { $unset: { teacherId: "" } },
    );

    await Activity.create({
      userId: req.user._id,
      action: "DELETE_TEACHER",
      details: `Deleted teacher account: ${teacher.name} (${teacher.email})`,
      ip: req.ip || "127.0.0.1",
    });

    return res.status(200).json({
      success: true,
      message: "Teacher account deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
}

// Teacher Global Analytics
export async function getTeacherAnalyticsController(req, res, next) {
  try {
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const activeTeachers = await User.countDocuments({
      role: "teacher",
      status: "active",
    });

    // Fallback Mocked Trends for charts!
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const performanceGrowth = months.map((m, idx) => ({
      month: m,
      engagement: 70 + Math.round(Math.random() * 25),
      growth: 10 + idx * 5 + Math.round(Math.random() * 8),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        activeTeachers,
        performanceGrowth,
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// STUDENT OPERATIONS
// =====================================

// Create Student
export async function createStudentController(req, res, next) {
  try {
    const {
      name,
      email,
      password = "student123",
      phone,
      bio,
      avatar,
      enrolledCourses = [],
    } = req.body ?? {};

    if (!name || !email) {
      throw new BadRequestError(
        "Name and email are required for student accounts.",
      );
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new BadRequestError(
        "A user with this email address already exists.",
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newStudent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      phone,
      bio,
      avatar,
      enrolledCourses,
      isActive: true,
      status: "active",
    });

    // Handle manual enrollments
    if (enrolledCourses.length > 0) {
      await Promise.all(
        enrolledCourses.map(async (cId) => {
          // Check duplicate
          const exists = await Enrollment.findOne({
            studentId: newStudent._id,
            courseId: cId,
          });
          if (!exists) {
            await Enrollment.create({
              studentId: newStudent._id,
              courseId: cId,
              assignedBy: req.user._id,
              progress: 0,
            });

            // Push student reference to Course
            await Course.findByIdAndUpdate(cId, {
              $addToSet: { students: newStudent._id },
            });
          }
        }),
      );
    }

    await Activity.create({
      userId: req.user._id,
      action: "CREATE_STUDENT",
      details: `Created student account for ${name} (${email})`,
      ip: req.ip || "127.0.0.1",
    });

    return res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      data: newStudent,
    });
  } catch (err) {
    next(err);
  }
}

// List Students
export async function getStudentsController(req, res, next) {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const query = { role: "student" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const [students, total] = await Promise.all([
      User.find(query)
        .skip(skipCount)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    // Enrich with dynamic course counts and average progress
    const enrichedStudents = await Promise.all(
      students.map(async (s) => {
        const enrolls = await Enrollment.find({ studentId: s._id });
        const avgProgress =
          enrolls.length > 0
            ? Math.round(
                enrolls.reduce((acc, e) => acc + e.progress, 0) /
                  enrolls.length,
              )
            : 0;

        return {
          ...s.toObject(),
          enrolledCoursesCount: enrolls.length,
          completedCoursesCount: enrolls.filter((e) => e.progress === 100)
            .length,
          averageProgress: avgProgress,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        students: enrichedStudents,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Get Single Student Details
export async function getStudentByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const student = await User.findOne({ _id: id, role: "student" });
    if (!student) {
      throw new NotFoundError("Student account not found.");
    }

    // Load dynamic enrollments
    const enrollmentsList = await Enrollment.find({
      studentId: student._id,
    }).populate("courseId", "title difficulty category thumbnail");

    // Quiz performance attempts
    const attempts = await QuizAttempt.find({
      studentId: student._id,
      status: "completed",
    }).populate("quizId", "title");

    // Attendance stats
    const [attendanceCount, totalClasses] = await Promise.all([
      Attendance.countDocuments({ studentId: student._id, status: "present" }),
      Attendance.countDocuments({ studentId: student._id }),
    ]);

    const attendanceRate =
      totalClasses > 0
        ? Math.round((attendanceCount / totalClasses) * 100)
        : 95; // baseline

    return res.status(200).json({
      success: true,
      data: {
        student,
        enrollments: enrollmentsList,
        attempts,
        attendanceRate,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Update Student Profile
export async function updateStudentController(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, phone, bio, avatar, status, enrolledCourses } =
      req.body ?? {};

    const student = await User.findOne({ _id: id, role: "student" });
    if (!student) {
      throw new NotFoundError("Student account not found.");
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (bio !== undefined) student.bio = bio;
    if (avatar !== undefined) student.avatar = avatar;
    if (status) {
      student.status = status;
      student.isActive = status === "active";
    }

    // Overwrite manual course enrollments
    if (enrolledCourses) {
      student.enrolledCourses = enrolledCourses;

      // 1. Purge old enrollments that are no longer present
      await Enrollment.deleteMany({
        studentId: student._id,
        courseId: { $nin: enrolledCourses },
      });
      await Course.updateMany(
        { students: student._id },
        { $pull: { students: student._id } },
      );

      // 2. Add new ones
      await Promise.all(
        enrolledCourses.map(async (cId) => {
          const exists = await Enrollment.findOne({
            studentId: student._id,
            courseId: cId,
          });
          if (!exists) {
            await Enrollment.create({
              studentId: student._id,
              courseId: cId,
              assignedBy: req.user._id,
              progress: 0,
            });
          }
          await Course.findByIdAndUpdate(cId, {
            $addToSet: { students: student._id },
          });
        }),
      );
    }

    await student.save();

    await Activity.create({
      userId: req.user._id,
      action: "UPDATE_STUDENT",
      details: `Updated student settings for ${student.name}`,
      ip: req.ip || "127.0.0.1",
    });

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully.",
      data: student,
    });
  } catch (err) {
    next(err);
  }
}

// Delete Student
export async function deleteStudentController(req, res, next) {
  try {
    const { id } = req.params;

    const student = await User.findOneAndDelete({ _id: id, role: "student" });
    if (!student) {
      throw new NotFoundError("Student account not found.");
    }

    // Purge records
    await Promise.all([
      Enrollment.deleteMany({ studentId: student._id }),
      QuizAttempt.deleteMany({ studentId: student._id }),
      Submission.deleteMany({ studentId: student._id }),
      Attendance.deleteMany({ studentId: student._id }),
      Course.updateMany(
        { students: student._id },
        { $pull: { students: student._id } },
      ),
    ]);

    await Activity.create({
      userId: req.user._id,
      action: "DELETE_STUDENT",
      details: `Deleted student: ${student.name} (${student.email})`,
      ip: req.ip || "127.0.0.1",
    });

    return res.status(200).json({
      success: true,
      message: "Student account deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
}

// Student Global Analytics
export async function getStudentAnalyticsController(req, res, next) {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const activeStudents = await User.countDocuments({
      role: "student",
      status: "active",
    });

    // Fallback Mocked Trends for charts!
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const learningTrend = months.map((m, idx) => ({
      month: m,
      studyHours: 45 + idx * 8 + Math.round(Math.random() * 15),
      quizAccuracy: 75 + Math.round(Math.random() * 18),
      attendance: 92 + Math.round(Math.random() * 6),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        learningTrend,
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// BULK OPERATIONS
// =====================================

// Bulk JSON User Import
export async function bulkImportUsersController(req, res, next) {
  try {
    const { usersList = [] } = req.body ?? {};

    if (!Array.isArray(usersList) || usersList.length === 0) {
      throw new BadRequestError(
        "Please upload a valid JSON array of user records.",
      );
    }

    let successCount = 0;
    let failCount = 0;

    for (const u of usersList) {
      try {
        const {
          name,
          email,
          role = "student",
          password = "user123",
          phone = "",
        } = u;

        if (!name || !email) continue;

        const exists = await User.findOne({ email });
        if (exists) {
          failCount++;
          continue;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
          name,
          email,
          password: hashedPassword,
          role,
          phone,
          isActive: true,
          status: "active",
        });

        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    await Activity.create({
      userId: req.user._id,
      action: "BULK_IMPORT",
      details: `Successfully batch imported ${successCount} users (${failCount} failures)`,
      ip: req.ip || "127.0.0.1",
    });

    return res.status(200).json({
      success: true,
      message: `Bulk import finished. Created ${successCount} profiles successfully with ${failCount} errors.`,
      data: {
        successCount,
        failCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Export All Platform Users (Return CSV schema payload)
export async function exportUsersController(req, res, next) {
  try {
    const users = await User.find().select("name email role status createdAt");

    let csvContent = "Name,Email,Role,Status,Joining Date\n";
    users.forEach((u) => {
      const joiningDate = new Date(u.createdAt).toLocaleDateString("en-US");
      csvContent += `"${u.name}","${u.email}","${u.role}","${u.status}","${joiningDate}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="lms_users_export.csv"',
    );
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
}
