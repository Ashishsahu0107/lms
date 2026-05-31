import { User } from "../models/User.js";

/**
 * Enterprise Gamification System Utility
 */

export async function awardXP(userId, xpAmount, reason = "LMS Action") {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "student") return null;

    user.xp = (user.xp || 0) + xpAmount;
    
    // Check milestones for achievements & badges
    let unlockedNew = false;
    
    if (user.xp >= 100 && !user.badges.includes("Novice Scholar")) {
      user.badges.push("Novice Scholar");
      user.achievements.push({
        title: "Novice Scholar",
        description: "Reached 100 XP points on LMS Pro!",
        unlockedAt: new Date(),
      });
      unlockedNew = true;
    }
    
    if (user.xp >= 500 && !user.badges.includes("Expert Thinker")) {
      user.badges.push("Expert Thinker");
      user.achievements.push({
        title: "Expert Thinker",
        description: "Reached 500 XP points on LMS Pro!",
        unlockedAt: new Date(),
      });
      unlockedNew = true;
    }

    if (user.xp >= 1000 && !user.badges.includes("Ultimate Graduate")) {
      user.badges.push("Ultimate Graduate");
      user.achievements.push({
        title: "Ultimate Graduate",
        description: "Reached 1,000 XP points on LMS Pro!",
        unlockedAt: new Date(),
      });
      unlockedNew = true;
    }

    await user.save();
    console.log(`[GAMIFICATION] Awarded ${xpAmount} XP to User ${userId}. Reason: ${reason}. Total: ${user.xp}`);

    if (unlockedNew) {
      try {
        const { getIO } = await import("../socket/index.js");
        const io = getIO();
        io.to(`user:${userId}`).emit("achievement-unlocked", {
          achievements: user.achievements,
          xp: user.xp,
          badges: user.badges,
          latestAchievement: user.achievements[user.achievements.length - 1],
        });
      } catch (e) {
        console.error("Failed to emit achievement socket event:", e);
      }
    }

    return { xpAwarded: xpAmount, totalXP: user.xp, unlockedNew };
  } catch (error) {
    console.error("Failed to award XP:", error);
    return null;
  }
}

export async function recordActivityStreak(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "student") return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!user.lastActiveDate) {
      // First active ever
      user.streak = 1;
      user.lastActiveDate = now;
      user.xp = (user.xp || 0) + 10; // Login bonus
    } else {
      const lastActive = new Date(user.lastActiveDate);
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      
      const diffTime = Math.abs(today - lastActiveDay);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active consecutive day!
        user.streak = (user.streak || 0) + 1;
        user.xp = (user.xp || 0) + 10; // Consecutive bonus
        user.lastActiveDate = now;
        
        // Award badge for 7-day streak
        let streakUnlocked = false;
        if (user.streak >= 7 && !user.badges.includes("7-Day Fire")) {
          user.badges.push("7-Day Fire");
          user.achievements.push({
            title: "7-Day Fire",
            description: "Maintained a consecutive 7-day learning streak!",
            unlockedAt: new Date(),
          });
          streakUnlocked = true;
        }

        if (streakUnlocked) {
          try {
            const { getIO } = await import("../socket/index.js");
            const io = getIO();
            io.to(`user:${userId}`).emit("achievement-unlocked", {
              achievements: user.achievements,
              xp: user.xp,
              badges: user.badges,
              latestAchievement: user.achievements[user.achievements.length - 1],
            });
          } catch (e) {
            console.error("Failed to emit streak achievement socket event:", e);
          }
        }
      } else if (diffDays > 1) {
        // Streak broken
        user.streak = 1;
        user.xp = (user.xp || 0) + 10; // Daily reward
        user.lastActiveDate = now;
      }
      // If diffDays === 0, already logged in today, do not award extra XP
    }

    await user.save();
    return { streak: user.streak, xp: user.xp };
  } catch (error) {
    console.error("Failed to record activity streak:", error);
    return null;
  }
}
