import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, BrainCircuit, RefreshCw } from "lucide-react";
import { aiChat } from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";

export default function FloatingAIChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      content: `Hello ${user?.name || "Scholar"}! 👋 I'm your LMS Pro AI Study Coach. How can I assist you with your studies today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const feedEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { sender: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Query general context-aware chat (without active page context, or general help)
      const res = await aiChat(userMsg.content, null, null, null, "ask");
      if (res.data?.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", content: res.data.data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            content:
              "Apologies, I encountered a temporary connection issue. Please try again.",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content:
            "Failed to connect to AI study coach. Please verify your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white shadow-2xl border-none flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
        title="AI Study Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-spin-slow" />
        ) : (
          <Sparkles className="h-6 w-6 animate-pulse" />
        )}
      </button>

      {/* Floating Chat Box Overlay */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-96 bg-base-100/95 backdrop-blur-xl border border-base-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="p-3 border-b border-base-300 bg-base-200/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4.5 w-4.5 text-primary animate-pulse" />
              <span className="font-bold text-xs text-base-content uppercase tracking-wider">
                AI Study Coach
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-xs btn-ghost btn-circle text-base-content/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-base-200/20">
            {messages.map((msg, index) => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 max-w-[85%] ${isAi ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center border shrink-0 text-[10px] font-bold uppercase select-none ${
                      isAi
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-base-200 border-base-300 text-base-content/60"
                    }`}
                  >
                    {isAi ? "AI" : "ME"}
                  </div>
                  <div
                    className={`rounded-xl px-3 py-2 text-xs leading-relaxed text-left whitespace-pre-wrap ${
                      isAi
                        ? "bg-base-100 border border-base-300 text-base-content"
                        : "bg-primary text-primary-content"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-[10px] text-base-content/60 ml-8 font-semibold">
                <RefreshCw className="h-3 w-3 animate-spin text-primary" />{" "}
                Thinking...
              </div>
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-base-300 flex gap-2 bg-base-100"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask anything..."
              className="flex-1 rounded-xl border border-base-300 bg-base-200/50 px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary btn-sm btn-circle shrink-0 flex items-center justify-center cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
