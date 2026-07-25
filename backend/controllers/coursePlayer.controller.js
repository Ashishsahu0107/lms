import { Course } from "../models/Course.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { StudentNote } from "../models/StudentNote.js";
import { Bookmark } from "../models/Bookmark.js";
import { Discussion } from "../models/Discussion.js";
import { Module } from "../models/Module.js";
import { User } from "../models/User.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { awardXPAndCheckStreak } from "../utils/gamification.js";
import { getIO, ROOMS, EVENTS } from "../socket/index.js";

// ======================================================
// GET /api/student/course-player/:courseId
// Load player layout details including syllabus, notes, bookmarks, progress
// ======================================================
export async function getCoursePlayerDetails(req, res, next) {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // 1. Fetch course with modules and topics
    const course = await Course.findById(courseId)
      .populate("teacherId", "name email avatar")
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: { path: "topics" },
      });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // 2. Fetch or create StudentProgress
    let progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      progress = await StudentProgress.create({
        studentId,
        courseId,
        lectureProgress: [],
        progress: 0,
      });
    }

    // 3. Fetch Student Notes
    const notes = await StudentNote.find({ studentId, courseId }).sort({
      createdAt: -1,
    });

    // 4. Fetch Student Bookmarks
    const bookmarks = await Bookmark.find({ studentId, courseId }).sort({
      videoPosition: 1,
    });

    // 5. Fetch Discussions
    const discussions = await Discussion.find({ courseId })
      .populate("studentId", "name avatar role")
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: {
        course,
        progress,
        notes,
        bookmarks,
        discussions: discussions.map((d) => ({
          _id: d._id,
          content: d.content,
          createdAt: d.createdAt,
          user: {
            name: d.studentId?.name || "Anonymous Learner",
            avatar: d.studentId?.avatar || "",
            role: d.studentId?.role || "student",
          },
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// POST /api/student/progress/update
// Update video play position, watch duration, watchTime spent, and check completion %
// ======================================================
export async function updateWatchProgress(req, res, next) {
  try {
    const { courseId, topicId, watchPosition, duration, watchTimeDelta } =
      req.body;
    const studentId = req.user._id;

    if (!courseId || !topicId) {
      throw new BadRequestError("Course ID and Topic ID are required");
    }

    let progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      progress = new StudentProgress({
        studentId,
        courseId,
        lectureProgress: [],
      });
    }

    // Find topic progress entry
    let topicEntry = progress.lectureProgress.find(
      (l) => l.lectureId.toString() === topicId,
    );
    let justCompleted = false;

    if (!topicEntry) {
      topicEntry = {
        lectureId: topicId,
        completed: false,
        watchPosition: watchPosition || 0,
        duration: duration || 0,
        watchTime: watchTimeDelta || 0,
      };
      progress.lectureProgress.push(topicEntry);
      // Re-find to maintain reference
      topicEntry =
        progress.lectureProgress[progress.lectureProgress.length - 1];
    } else {
      topicEntry.watchPosition = watchPosition || 0;
      if (duration) topicEntry.duration = duration;
      if (watchTimeDelta) {
        topicEntry.watchTime =
          (topicEntry.watchTime || 0) + Number(watchTimeDelta);
        progress.totalWatchTime =
          (progress.totalWatchTime || 0) + Number(watchTimeDelta);
      }
    }

    // Mark completed if >= 90% watched
    if (
      !topicEntry.completed &&
      topicEntry.duration > 0 &&
      topicEntry.watchPosition >= topicEntry.duration * 0.9
    ) {
      topicEntry.completed = true;
      topicEntry.completedAt = new Date();
      justCompleted = true;
    }

    // Update overall course stats
    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: { path: "topics", select: "_id" },
    });

    let totalTopicsCount = 0;
    if (course && course.modules) {
      course.modules.forEach((mod) => {
        totalTopicsCount += mod.topics?.length || 0;
      });
    }
    if (totalTopicsCount === 0) totalTopicsCount = 1;

    const completedCount = progress.lectureProgress.filter(
      (l) => l.completed,
    ).length;
    progress.progress = Math.round((completedCount / totalTopicsCount) * 100);
    progress.lastAccessedTopicId = topicId;
    progress.lastAccessedAt = new Date();

    const reachedCourseCompletion =
      progress.progress === 100 && !progress.completedAt;
    if (progress.progress === 100) {
      progress.completedAt = new Date();
    }

    await progress.save();

    // Gamification Awards & Sockets
    const io = getIO();
    const studentRoom = ROOMS.student(studentId.toString());

    // Emit live progress sync back to the student's room (multi-tab sync)
    io.to(studentRoom).emit("progressUpdated", {
      courseId,
      topicId,
      progress: progress.progress,
      watchPosition: topicEntry.watchPosition,
      completed: topicEntry.completed,
    });

    if (justCompleted) {
      io.to(ROOMS.course(courseId)).emit("lectureCompleted", {
        studentId,
        topicId,
      });
      await awardXPAndCheckStreak(studentId, "COMPLETE_TOPIC", { topicId });
    }

    if (reachedCourseCompletion) {
      await awardXPAndCheckStreak(studentId, "COMPLETE_COURSE", { courseId });
    }

    return res.status(200).json({
      success: true,
      message: "Watch progress updated successfully",
      data: {
        progress: progress.progress,
        watchPosition: topicEntry.watchPosition,
        completed: topicEntry.completed,
        justCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// POST /api/student/notes
// Add student personal timestamped note
// ======================================================
export async function createOrUpdateNote(req, res, next) {
  try {
    const { courseId, topicId, content, videoPosition } = req.body;
    const studentId = req.user._id;

    if (!courseId || !topicId || !content) {
      throw new BadRequestError(
        "Course ID, Topic ID, and Content are required",
      );
    }

    const note = await StudentNote.create({
      studentId,
      courseId,
      topicId,
      content,
      videoPosition: videoPosition || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Note saved successfully",
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/student/notes/:courseId
// Fetch student personal notes for a course
// ======================================================
export async function getStudentNotes(req, res, next) {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const notes = await StudentNote.find({ studentId, courseId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// POST /api/student/bookmarks
// Create student timestamped bookmark
// ======================================================
export async function createBookmark(req, res, next) {
  try {
    const { courseId, topicId, title, videoPosition } = req.body;
    const studentId = req.user._id;

    if (!courseId || !topicId || videoPosition === undefined) {
      throw new BadRequestError(
        "Course ID, Topic ID, and Video Position are required",
      );
    }

    const bookmark = await Bookmark.create({
      studentId,
      courseId,
      topicId,
      title: title || "Bookmarked Position",
      videoPosition,
    });

    return res.status(201).json({
      success: true,
      message: "Bookmark created successfully",
      data: bookmark,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/student/bookmarks/:courseId
// Fetch student bookmarks for a course
// ======================================================
export async function getStudentBookmarks(req, res, next) {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const bookmarks = await Bookmark.find({ studentId, courseId }).sort({
      videoPosition: 1,
    });

    return res.status(200).json({
      success: true,
      data: bookmarks,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// GET /api/student/course/:courseId/discussions
// Fetch discussion comments
// ======================================================
export async function getDiscussionMessages(req, res, next) {
  try {
    const { courseId } = req.params;

    const discussions = await Discussion.find({ courseId })
      .populate("studentId", "name avatar role")
      .sort({ createdAt: 1 })
      .limit(100);

    const formatted = discussions.map((d) => ({
      _id: d._id,
      content: d.content,
      createdAt: d.createdAt,
      user: {
        name: d.studentId?.name || "Anonymous Learner",
        avatar: d.studentId?.avatar || "",
        role: d.studentId?.role || "student",
      },
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// POST /api/student/course/:courseId/discussions
// Post a new comment to discussion board
// ======================================================
export async function postDiscussionMessage(req, res, next) {
  try {
    const { courseId } = req.params;
    const { content } = req.body;
    const studentId = req.user._id;

    if (!content || !content.trim()) {
      throw new BadRequestError("Comment content cannot be empty");
    }

    const d = await Discussion.create({
      courseId,
      studentId,
      content: content.trim(),
    });

    const student = await User.findById(studentId).select("name avatar role");

    const payload = {
      _id: d._id,
      content: d.content,
      createdAt: d.createdAt,
      user: {
        name: student.name || "Anonymous Learner",
        avatar: student.avatar || "",
        role: student.role || "student",
      },
    };

    // Emit live to course room
    const io = getIO();
    io.to(ROOMS.course(courseId)).emit("discussionComment", payload);

    return res.status(201).json({
      success: true,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
}
