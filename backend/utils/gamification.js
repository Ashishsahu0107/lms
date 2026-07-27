import { User } from "../models/User.js";
import { getIO, ROOMS } from "../socket/index.js";

// Helper to check date differences ignoring time
function getCalendarDateString(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function awardXPAndCheckStreak(
  userId,
  actionType,
  actionPayload = {},
) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    let xpGained = 0;
    let badgeUnlocked = null;
    let newlyUnlockedAchievements = [];

    // ─────────────────────────────────────────────────────────────
    // 1. STREAK CHECK-IN LOGIC
    // ─────────────────────────────────────────────────────────────
    const todayStr = getCalendarDateString(new Date());
    const lastActiveStr = user.lastActiveDate
      ? getCalendarDateString(user.lastActiveDate)
      : "";

    if (lastActiveStr === "") {
      // First activity ever
      user.streak = 1;
      user.lastActiveDate = new Date();
      xpGained += 15; // streak starter bonus
    } else if (lastActiveStr === todayStr) {
      // Already active today, do not increment streak, no check-in bonus
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getCalendarDateString(yesterday);

      if (lastActiveStr === yesterdayStr) {
        // Active yesterday, increment streak
        user.streak += 1;
        user.lastActiveDate = new Date();
        xpGained += 15; // daily streak bonus
      } else {
        // Gap of more than 1 day, reset streak to 1
        user.streak = 1;
        user.lastActiveDate = new Date();
        xpGained += 15; // reset streak starter bonus
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. XP ALLOCATION BY ACTION TYPE
    // ─────────────────────────────────────────────────────────────
    switch (actionType) {
      case "COMPLETE_TOPIC":
        xpGained += 10;
        // Check "Quick Starter" badge (enrolled/completed first topic)
        if (!user.badges.includes("Quick Starter")) {
          badgeUnlocked = "Quick Starter";
          newlyUnlockedAchievements.push({
            title: "Quick Starter",
            description: "Completed your first topic syllabus material.",
          });
        }
        break;

      case "COMPLETE_QUIZ":
        xpGained += 50;
        const accuracy = actionPayload.accuracy || 0;
        if (accuracy >= 90) {
          xpGained += 20; // 90%+ bonus
          if (!user.badges.includes("Quiz Master")) {
            badgeUnlocked = "Quiz Master";
            newlyUnlockedAchievements.push({
              title: "Quiz Master",
              description:
                "Scored 90% or above on an official quiz evaluation.",
            });
          }
        }
        if (accuracy === 100) {
          xpGained += 10; // perfect score bonus
          if (!user.badges.includes("Perfect Score")) {
            badgeUnlocked = "Perfect Score";
            newlyUnlockedAchievements.push({
              title: "Perfect Score",
              description:
                "Earned a flawless 100% score on a quiz or assignment.",
            });
          }
        }
        break;

      case "SUBMIT_ASSIGNMENT":
        xpGained += 30;
        break;

      case "COMPLETE_COURSE":
        xpGained += 200;
        if (!user.badges.includes("Syllabus Conqueror")) {
          badgeUnlocked = "Syllabus Conqueror";
          newlyUnlockedAchievements.push({
            title: "Syllabus Conqueror",
            description:
              "Conquered 100% curriculum validation of a full course.",
          });
        }
        break;

      default:
        break;
    }

    // ─────────────────────────────────────────────────────────────
    // 3. STREAK-BASED BADGES
    // ─────────────────────────────────────────────────────────────
    if (user.streak >= 3 && !user.badges.includes("Consistent Learner")) {
      badgeUnlocked = "Consistent Learner";
      newlyUnlockedAchievements.push({
        title: "Consistent Learner",
        description: "Maintained a continuous 3-day active learning streak.",
      });
    }

    // Apply XP increase
    user.xp = (user.xp || 0) + xpGained;

    // Apply newly unlocked achievements
    if (badgeUnlocked && !user.badges.includes(badgeUnlocked)) {
      user.badges.push(badgeUnlocked);
    }

    if (newlyUnlockedAchievements.length > 0) {
      user.achievements.push(
        ...newlyUnlockedAchievements.map((a) => ({
          title: a.title,
          description: a.description,
          unlockedAt: new Date(),
        })),
      );
    }

    await user.save();

    // ─────────────────────────────────────────────────────────────
    // 4. REAL-TIME SOCKET EMISSION
    // ─────────────────────────────────────────────────────────────
    if (newlyUnlockedAchievements.length > 0) {
      try {
        const io = getIO();
        const personalRoom = ROOMS.student(userId.toString());
        io.to(personalRoom).emit("achievement-unlocked", {
          xp: user.xp,
          badges: user.badges,
          achievements: user.achievements,
          latestAchievement:
            newlyUnlockedAchievements[newlyUnlockedAchievements.length - 1],
        });
      } catch (err) {
        console.error(
          "Failed to emit achievement-unlocked socket event:",
          err.message,
        );
      }
    }

    return {
      xp: user.xp,
      streak: user.streak,
      badges: user.badges,
      achievements: user.achievements,
      gainedXP: xpGained,
      unlockedBadge: badgeUnlocked,
    };
  } catch (err) {
    console.error("Error in awardXPAndCheckStreak:", err);
    return null;
  }
}
