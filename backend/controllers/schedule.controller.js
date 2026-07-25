import { Schedule } from "../models/Schedule.js";
import { Course } from "../models/Course.js";
import { Assignment } from "../models/Assignment.js";
import { Quiz } from "../models/Quiz.js";
import { BadRequestError, ForbiddenError } from "../utils/errors.js";

// ============================================
// GET /api/schedules/calendar
// Fetch all calendar events (Classes, Quizzes, Assignments, Events)
// ============================================
export async function getCalendarEvents(req, res, next) {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let courses = [];
    if (role === "student") {
      courses = await Course.find({ students: userId });
    } else if (role === "teacher") {
      courses = await Course.find({ teacherId: userId });
    } else if (role === "super_admin") {
      courses = await Course.find();
    }

    const courseIds = courses.map((c) => c._id);

    // 1. Fetch custom Schedules
    const query = {
      $or: [{ courseId: { $in: courseIds } }, { userId: userId }],
    };
    const schedules = await Schedule.find(query).lean();

    // 2. Fetch Assignments as events
    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
    }).lean();
    const assignmentEvents = assignments.map((asm) => ({
      _id: asm._id,
      title: `DEADLINE: ${asm.title}`,
      description: asm.description || "Submit assignment solution before date",
      type: "assignment",
      startDate: asm.dueDate,
      endDate: asm.dueDate,
      courseId: asm.courseId,
    }));

    // 3. Fetch Quizzes as events
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).lean();
    const quizEvents = quizzes.map((q) => ({
      _id: q._id,
      title: `QUIZ: ${q.title}`,
      description: `Test quiz: ${q.questions?.length || 0} questions`,
      type: "quiz",
      startDate: q.createdAt, // Or start date if quiz schedule exists
      endDate: q.createdAt,
      courseId: q.courseId,
    }));

    // Merge everything
    const allEvents = [...schedules, ...assignmentEvents, ...quizEvents];

    return res.status(200).json({
      success: true,
      data: allEvents,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/schedules
// Create a class or custom event
// ============================================
export async function createSchedule(req, res, next) {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      courseId,
      meetingUrl,
      meetingId,
    } = req.body;
    const userId = req.user._id;

    if (!title || !type || !startDate || !endDate) {
      throw new BadRequestError(
        "Title, type, start date, and end date are required",
      );
    }

    // Verify course ownership
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new BadRequestError("Course not found");
      }
      if (
        req.user.role !== "super_admin" &&
        course.teacherId.toString() !== userId.toString()
      ) {
        throw new ForbiddenError("Access denied: you do not own this course");
      }
    }

    // Construct meeting details if type is class and Zoom/Meet is requested
    let finalMeetingUrl = meetingUrl || "";
    let finalMeetingId = meetingId || "";

    if (type === "class" && !finalMeetingUrl) {
      // Sophisticated mock Zoom link generator
      const randomMeeting = Math.floor(100000000 + Math.random() * 900000000);
      finalMeetingUrl = `https://zoom.us/j/${randomMeeting}`;
      finalMeetingId = randomMeeting.toString();
    }

    const event = await Schedule.create({
      title,
      description: description || "",
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      courseId: courseId || null,
      userId: courseId ? null : userId,
      meetingUrl: finalMeetingUrl,
      meetingId: finalMeetingId,
    });

    // Award XP to teacher for scheduling a live class
    try {
      if (req.user.role === "teacher") {
        const { awardXP } = await import("../utils/gamification.js");
        await awardXP(userId, 15, "Schedule live class");
      }
    } catch (e) {
      // Ignored
    }

    // Emit live Socket notification to students in the course
    try {
      const { getIO } = await import("../socket/index.js");
      const io = getIO();
      io.to("teacher:dashboard").emit("newNotification", {
        type: "scheduleCreated",
        message: `New live class scheduled: '${title}'`,
        courseId,
      });
    } catch (e) {
      // Ignored
    }

    return res.status(201).json({
      success: true,
      message: "Schedule event registered successfully",
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// DELETE /api/schedules/:id
// Delete a schedule event
// ============================================
export async function deleteSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Schedule.findById(id);

    if (!event) {
      throw new BadRequestError("Event not found");
    }

    // Ownership check
    if (
      req.user.role !== "super_admin" &&
      event.userId?.toString() !== req.user._id.toString()
    ) {
      if (event.courseId) {
        const course = await Course.findById(event.courseId);
        if (
          !course ||
          course.teacherId.toString() !== req.user._id.toString()
        ) {
          throw new ForbiddenError(
            "You can only modify events you scheduled or own",
          );
        }
      } else {
        throw new ForbiddenError("You do not own this event");
      }
    }

    await Schedule.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Schedule event deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
