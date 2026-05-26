import React, { useState, useEffect } from "react";
import { Trophy, Award, Zap, Sparkles, RefreshCw, Flame, CheckCircle, Gift } from "lucide-react";
import { getMe } from "../../../services/authService";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Achievements() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      if (res && res.success) {
        setUserData(res.data?.user || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimReward = (badge) => {
    toast.success(`Claimed reward coupon for unlocking '${badge}' badge! Check your email!`);
  };

  const badgeIcons = {
    "Verified Member": CheckCircle,
    "Verified Student": CheckCircle,
    "Novice Scholar": Trophy,
    "Expert Thinker": Award,
    "Ultimate Graduate": Sparkles,
  };

  const badgeColors = {
    "Verified Member": "bg-blue-500/10 border-blue-500/25 text-blue-400",
    "Verified Student": "bg-blue-500/10 border-blue-500/25 text-blue-400",
    "Novice Scholar": "bg-purple-500/10 border-purple-500/25 text-purple-400",
    "Expert Thinker": "bg-amber-500/10 border-amber-500/25 text-amber-400",
    "Ultimate Graduate": "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-400 animate-bounce" /> Gamified Rewards & Achievements
          </h1>
          <p className="text-sm text-white/50 mt-1">Unlock badges, maintain daily streaks, accumulate XP, and unlock learning milestones.</p>
        </div>
        
        <button
          onClick={loadData}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white hover:bg-white/10 self-end"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center text-white/40 gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Loading achievements board...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main indicators: Streak, XP, Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Streak */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest">Active learning Streak</span>
                <p className="text-4xl font-black text-white mt-1">{userData?.streak ?? 1} Days</p>
                <p className="text-xs text-white/50 font-medium">Keep completing assignments to fuel the streak fire!</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow animate-pulse">
                <Flame className="h-7 w-7" />
              </div>
            </motion.div>

            {/* XP Score */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">Total XP Score</span>
                <p className="text-4xl font-black text-white mt-1">{(userData?.xp ?? 15).toLocaleString()}</p>
                <p className="text-xs text-white/50 font-medium">Accumulating points unlocks rare milestone badges!</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
                <Zap className="h-7 w-7" />
              </div>
            </motion.div>

            {/* Badges unlocked */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest">Badges Unlocked</span>
                <p className="text-4xl font-black text-white mt-1">{userData?.badges?.length || 1}</p>
                <p className="text-xs text-white/50 font-medium">Unlocks learning coupon discounts on new courses!</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow">
                <Award className="h-7 w-7" />
              </div>
            </motion.div>
          </div>

          {/* Badges Grid & Milestones list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unlocked Badges list */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-5 w-5 text-purple-400" /> Milestone Badges Catalog
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {userData?.badges?.length === 0 ? (
                  <p className="text-white/40 text-xs col-span-full py-8 text-center">No badges unlocked yet. Keep studying!</p>
                ) : (
                  userData?.badges?.map((badge, idx) => {
                    const Icon = badgeIcons[badge] || Award;
                    return (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        key={idx}
                        className={`rounded-2xl border p-4 text-center space-y-3 flex flex-col items-center justify-center shadow ${badgeColors[badge] || badgeColors["Verified Member"]}`}
                      >
                        <div className="rounded-full border border-current bg-white/5 p-3">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white leading-tight">{badge}</p>
                          <span className="text-[8px] uppercase tracking-widest font-extrabold text-white/40 block mt-1">Unlocked</span>
                        </div>
                        <button
                          onClick={() => handleClaimReward(badge)}
                          className="flex items-center gap-1 text-[9px] font-bold text-white uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/10 rounded py-1 px-2.5"
                        >
                          <Gift className="h-3 w-3" /> Claim Reward
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Achievements Log timeline */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col h-[400px]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-amber-400" /> Unlock Log History
              </h2>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {userData?.achievements?.length === 0 ? (
                  <div className="text-white/30 text-xs py-8 text-center">Complete quizzes to unlock achievements milestones!</div>
                ) : (
                  userData?.achievements?.map((ach, idx) => (
                    <div key={idx} className="flex gap-3 pl-3.5 border-l border-white/10 relative">
                      <div className="absolute left-[-3.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">{ach.title}</p>
                        <p className="text-[10px] text-white/50 mt-0.5 leading-snug">{ach.description}</p>
                        <span className="text-[8px] text-white/30 font-bold uppercase block mt-1">
                          {new Date(ach.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
