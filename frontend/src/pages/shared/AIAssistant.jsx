import React, { useState, useRef, useEffect } from "react";
import { Cpu, Send, Sparkles, RefreshCw, User, BrainCircuit } from "lucide-react";
import { aiAssistantChat } from "../../services/aiService";
import { getStoredUser } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistant() {
  const user = getStoredUser();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello **${user?.name || "Scholar"}**! 📚

I'm your **LMS Pro AI Study Buddy**. I can help you with anything relating to your courses:
- **Concept explanations**: Ask me to explain React State, MongoDB pipelines, or CSS Grids.
- **Study tips**: Ask me how to improve your daily streak.
- **Coding help**: Write some code and ask me to review it!

What can I help you learn today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const feedEndRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    const promptToSend = input;
    setInput("");
    
    try {
      setLoading(true);
      const res = await aiAssistantChat(promptToSend);
      if (res && res.success) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: "ai",
          text: res.data?.reply || "I am currently processing your query. Please ask again in a moment.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-5 ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`rounded-xl border p-2.5 ${isDarkMode ? "border-blue-500/20 bg-blue-500/10 text-blue-400" : "border-blue-200 bg-blue-50 text-blue-600"}`}>
            <BrainCircuit className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-2xl font-black leading-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>AI Coach & Concept Chatbot</h1>
            <p className={`text-xs ${isDarkMode ? "text-white/50" : "text-slate-500"}`}>Concept helper, coding reviewer, and instant platform guide.</p>
          </div>
        </div>

        <span className={`flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest border py-1.5 px-3 rounded-full ${
          isDarkMode ? "bg-white/5 border-white/5 text-white/40" : "bg-slate-100 border-slate-200 text-slate-600"
        }`}>
          <Sparkles className="h-3 w-3 text-blue-500 animate-spin" /> AI Coach Online
        </span>
      </div>

      {/* Chat Window Container */}
      <div className={`rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col h-[500px] ${
        isDarkMode ? "border-white/10 bg-black/40" : "border-slate-250 bg-white"
      }`}>
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3.5 max-w-[85%] ${isAi ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 text-xs font-bold uppercase select-none ${
                    isAi
                      ? isDarkMode ? "bg-blue-500/10 border-blue-500/25 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"
                      : isDarkMode ? "bg-white/5 border-white/10 text-white/50" : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}>
                    {isAi ? <Cpu className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className={`rounded-2xl border p-4 text-xs leading-relaxed text-left whitespace-pre-wrap ${
                      isAi
                        ? isDarkMode ? "bg-white/5 border-white/5 text-white/80 font-medium" : "bg-slate-50 border-slate-200 text-slate-700 font-medium"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white font-bold"
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`text-[9px] block px-1 ${isDarkMode ? "text-white/20" : "text-slate-400"}`}>{msg.time}</span>
                  </div>
                </motion.div>
              );
            })}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3.5 items-center mr-auto text-left"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${
                  isDarkMode ? "border-blue-500/20 bg-blue-500/10 text-blue-400" : "border-blue-200 bg-blue-50 text-blue-600"
                }`}>
                  <Cpu className="h-4 w-4" />
                </div>
                <div className={`flex items-center gap-1 rounded-2xl border px-4 py-3 text-xs font-bold ${
                  isDarkMode ? "bg-white/5 border-white/5 text-white/40" : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" /> AI Coach is typing...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={feedEndRef} />
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSend} className={`p-4 border-t flex gap-3 ${isDarkMode ? "border-white/5 bg-black/10" : "border-slate-100 bg-slate-50/50"}`}>
          <input
            type="text"
            placeholder="Ask me any concepts, study tips, or course code review..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className={`flex-1 rounded-xl border px-4 text-xs focus:outline-none transition-all ${
              isDarkMode
                ? "border-white/10 bg-black/40 text-white placeholder-white/30 focus:border-blue-500/50"
                : "border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500"
            }`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white hover:opacity-90 shadow-xl shadow-blue-600/25 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
