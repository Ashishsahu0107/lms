import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Cpu,
  Send,
  Sparkles,
  RefreshCw,
  User,
  BrainCircuit,
  Plus,
  Trash2,
  Search,
  MessageSquare,
  Menu,
  X,
  Copy,
  Check,
} from "lucide-react";
import {
  getAiChats,
  createAiChat,
  getAiChatDetails,
  deleteAiChat,
  retryAiChat,
} from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// ==========================================
// CUSTOM LIGHTWEIGHT MARKDOWN & CODE BLOCKS
// ==========================================
function parseInlineMarkdown(textLine) {
  if (!textLine) return "";
  const tokens = textLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md font-mono text-[10px] bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong
          key={i}
          className="font-extrabold text-slate-950 dark:text-white"
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      return token;
    }
  });
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-950 text-slate-100 font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 select-none">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextBlock({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let currentList = null;
  let currentBlockquote = null;
  let blockquoteType = null; // 'tip', 'important', 'warning', 'caution', 'note', 'default'

  const flushBlockquote = (key) => {
    if (currentBlockquote) {
      let bgClass =
        "bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-white/10";
      let textClass = "text-slate-700 dark:text-slate-300";
      let borderClass = "border-l-4";
      let title = "";
      let titleColor = "";

      if (blockquoteType === "tip") {
        bgClass = "bg-emerald-500/5 border-emerald-500/20";
        textClass = "text-emerald-800 dark:text-emerald-300";
        borderClass = "border-l-4 border-emerald-500";
        title = "💡 TIP";
        titleColor = "text-emerald-600 dark:text-emerald-400";
      } else if (blockquoteType === "important") {
        bgClass = "bg-blue-500/5 border-blue-500/20";
        textClass = "text-blue-800 dark:text-blue-300";
        borderClass = "border-l-4 border-blue-500";
        title = "✨ IMPORTANT";
        titleColor = "text-blue-600 dark:text-blue-400";
      } else if (blockquoteType === "warning") {
        bgClass = "bg-amber-500/5 border-amber-500/20";
        textClass = "text-amber-800 dark:text-amber-300";
        borderClass = "border-l-4 border-amber-500";
        title = "⚠️ WARNING";
        titleColor = "text-amber-600 dark:text-amber-400";
      } else if (blockquoteType === "caution") {
        bgClass = "bg-rose-500/5 border-rose-500/20";
        textClass = "text-rose-800 dark:text-rose-300";
        borderClass = "border-l-4 border-rose-500";
        title = "🚨 CAUTION";
        titleColor = "text-rose-600 dark:text-rose-400";
      } else if (blockquoteType === "note") {
        bgClass = "bg-slate-500/5 border-slate-500/20";
        textClass = "text-slate-800 dark:text-slate-300";
        borderClass = "border-l-4 border-slate-500";
        title = "📝 NOTE";
        titleColor = "text-slate-600 dark:text-slate-400";
      }

      elements.push(
        <div
          key={`bq-${key}`}
          className={`my-3 p-3.5 rounded-xl border ${borderClass} ${bgClass} text-xs`}
        >
          {title && (
            <div
              className={`font-bold mb-1 tracking-wider text-[10px] ${titleColor}`}
            >
              {title}
            </div>
          )}
          <div className={`${textClass} space-y-1`}>
            {currentBlockquote.map((line, idx) => (
              <p key={idx}>{parseInlineMarkdown(line)}</p>
            ))}
          </div>
        </div>,
      );
      currentBlockquote = null;
      blockquoteType = null;
    }
  };

  const flushList = (key) => {
    if (currentList) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1">
          {currentList.map((item, idx) => (
            <li
              key={idx}
              className="text-slate-700 dark:text-slate-300 text-xs"
            >
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      );
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle headers
    if (trimmed.startsWith("# ")) {
      flushBlockquote(i);
      flushList(i);
      elements.push(
        <h1
          key={i}
          className="text-sm font-black text-slate-900 dark:text-white mt-4 mb-2 tracking-wide uppercase border-b border-slate-200 dark:border-white/5 pb-1"
        >
          {parseInlineMarkdown(trimmed.slice(2))}
        </h1>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushBlockquote(i);
      flushList(i);
      elements.push(
        <h2
          key={i}
          className="text-xs font-black text-slate-900 dark:text-white mt-3 mb-1.5 uppercase"
        >
          {parseInlineMarkdown(trimmed.slice(3))}
        </h2>,
      );
    } else if (trimmed.startsWith("### ")) {
      flushBlockquote(i);
      flushList(i);
      elements.push(
        <h3
          key={i}
          className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-2 mb-1"
        >
          {parseInlineMarkdown(trimmed.slice(4))}
        </h3>,
      );
    }
    // Handle blockquotes / alerts
    else if (trimmed.startsWith(">")) {
      flushList(i);
      let content = trimmed.slice(1).trim();

      if (content.startsWith("[!TIP]")) {
        flushBlockquote(i);
        blockquoteType = "tip";
        currentBlockquote = [];
      } else if (content.startsWith("[!IMPORTANT]")) {
        flushBlockquote(i);
        blockquoteType = "important";
        currentBlockquote = [];
      } else if (content.startsWith("[!WARNING]")) {
        flushBlockquote(i);
        blockquoteType = "warning";
        currentBlockquote = [];
      } else if (content.startsWith("[!CAUTION]")) {
        flushBlockquote(i);
        blockquoteType = "caution";
        currentBlockquote = [];
      } else if (content.startsWith("[!NOTE]")) {
        flushBlockquote(i);
        blockquoteType = "note";
        currentBlockquote = [];
      } else {
        if (!currentBlockquote) {
          blockquoteType = "default";
          currentBlockquote = [];
        }
        currentBlockquote.push(content);
      }
    }
    // Handle lists
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushBlockquote(i);
      if (!currentList) {
        currentList = [];
      }
      currentList.push(trimmed.slice(2));
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      flushBlockquote(i);
      flushList(i);
      elements.push(
        <div
          key={i}
          className="pl-4 my-1 text-slate-700 dark:text-slate-300 text-xs flex gap-1.5"
        >
          <span className="font-bold text-blue-500 shrink-0">
            {trimmed.match(/^\d+\./)[0]}
          </span>
          <span>{parseInlineMarkdown(trimmed.replace(/^\d+\.\s/, ""))}</span>
        </div>,
      );
    }
    // Empty lines
    else if (trimmed === "") {
      flushBlockquote(i);
      flushList(i);
      elements.push(<div key={i} className="h-2" />);
    }
    // Standard lines
    else {
      flushBlockquote(i);
      flushList(i);
      elements.push(
        <p
          key={i}
          className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed my-1"
        >
          {parseInlineMarkdown(line)}
        </p>,
      );
    }
  }

  flushBlockquote(lines.length);
  flushList(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

function MarkdownRenderer({ content }) {
  if (!content) return null;
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const codeContent = part.slice(3, -3);
          const firstNewlineIndex = codeContent.indexOf("\n");
          let language = "code";
          let code = codeContent;
          if (firstNewlineIndex !== -1) {
            language =
              codeContent.substring(0, firstNewlineIndex).trim() || "code";
            code = codeContent.substring(firstNewlineIndex + 1);
          }
          return <CodeBlock key={index} language={language} code={code} />;
        } else {
          return <TextBlock key={index} text={part} />;
        }
      })}
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  // Conversational History lists
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Messaging inputs & state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [streamText, setStreamText] = useState(""); // Accumulates streamed words
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar drawer toggler

  const socketRef = useRef(null);
  const feedEndRef = useRef(null);

  // Initialize socket connection with Auth Handshake Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    socketRef.current = io(`http://${window.location.hostname}:5000`, {
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("AI Sockets Handshake Active");
    });

    // Real-Time Socket events handlers
    socketRef.current.on("ai-message-saved", (data) => {
      if (data && data.message && data.chatId === selectedChatId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m && m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    socketRef.current.on("ai-typing", (data) => {
      if (data && data.chatId === selectedChatId) {
        setAiTyping(true);
        setStreamText("");
      }
    });

    socketRef.current.on("ai-word", (data) => {
      if (data && data.chatId === selectedChatId) {
        setAiTyping(true);
        setStreamText((prev) => prev + (data.word || ""));
      }
    });

    socketRef.current.on("ai-stop-typing", (data) => {
      if (data && data.chatId === selectedChatId) {
        setAiTyping(false);
      }
    });

    socketRef.current.on("ai-message-complete", (data) => {
      if (data && data.message && data.chatId === selectedChatId) {
        setAiTyping(false);
        setStreamText("");
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m && m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });

        // Refresh sidebar conversation list to sync auto-updated titles
        loadChatThreads(false);
      }
    });

    socketRef.current.on("ai-chat-error", (data) => {
      toast.error(data.message || "An AI stream error occurred");
      setAiTyping(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [selectedChatId]);

  async function loadChatThreads(selectFirst = false) {
    try {
      const res = await getAiChats();
      if (res && res.success) {
        setChats(res.data || []);
        if (selectFirst && res.data && res.data.length > 0) {
          setSelectedChatId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load AI threads:", err);
    }
  }

  async function loadChatDetails(id) {
    try {
      setLoading(true);
      const res = await getAiChatDetails(id);
      if (res && res.success && res.data) {
        setActiveChat(res.data);
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch chat logs:", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch all chat threads on mount
  useEffect(() => {
    loadChatThreads(true);
  }, []);

  // Fetch single chat details when selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      loadChatDetails(selectedChatId);
    } else {
      const timer = setTimeout(() => {
        setActiveChat(null);
        setMessages([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    setStreamText("");
    setAiTyping(false);
  }, [selectedChatId]);

  // Scroll to chat feed bottom automatically
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText, aiTyping]);

  const handleStartNewChat = async () => {
    try {
      const res = await createAiChat("New Conversation");
      if (res && res.success && res.data) {
        setChats((prev) => [res.data, ...prev]);
        setSelectedChatId(res.data._id);
        setSidebarOpen(false);
        toast.success("New AI study thread started!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this conversation thread?",
      )
    )
      return;
    try {
      const res = await deleteAiChat(id);
      if (res && res.success) {
        setChats((prev) => prev.filter((c) => c._id !== id));
        if (selectedChatId === id) {
          setSelectedChatId("");
        }
        toast.success("AI Conversation thread deleted");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopGeneration = () => {
    if (!selectedChatId) return;
    socketRef.current?.emit("stop-ai-generation", { chatId: selectedChatId });
    setAiTyping(false);
    toast.success("Generation stopped.");
  };

  const handleCopyResponse = (text) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Response copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy response.");
    }
  };

  const handleRetry = async () => {
    if (!selectedChatId || aiTyping) return;
    try {
      setAiTyping(true);
      setStreamText("");
      const res = await retryAiChat(selectedChatId);
      if (res && res.success && res.queryText) {
        if (res.data && res.data.messages) {
          setMessages(res.data.messages);
        } else {
          setMessages((prev) => {
            const newMsgs = [...prev];
            if (newMsgs[newMsgs.length - 1]?.sender === "ai") newMsgs.pop();
            if (newMsgs[newMsgs.length - 1]?.sender === "user") newMsgs.pop();
            return newMsgs;
          });
        }
        socketRef.current?.emit("send-ai-message", {
          chatId: selectedChatId,
          content: res.queryText,
        });
        toast.success("Regenerating response...");
      } else {
        setAiTyping(false);
        toast.error("Could not retry this conversation thread");
      }
    } catch (err) {
      console.error("Retry failed:", err);
      setAiTyping(false);
      toast.error("Retry failed. Please try again.");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChatId) return;

    // Send via socket connection
    socketRef.current.emit("send-ai-message", {
      chatId: selectedChatId,
      content: input.trim(),
    });

    setInput("");
  };

  // Filter conversation logs based on title
  const filteredChats = chats.filter((c) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex gap-4 overflow-hidden relative">
      {/* MOBILE TRIGGER */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`fixed bottom-24 right-6 lg:hidden z-30 p-3 rounded-full shadow-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-95 transition border border-white/10`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ========================================================
         1. CHAT SIDEBAR (CONVERSATION HISTORY)
         ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 lg:static z-40 w-72 shrink-0 border h-full rounded-3xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 ${
          isDarkMode
            ? "border-white/10 bg-slate-900/40 backdrop-blur-xl"
            : "border-slate-200 bg-white"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-black tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-blue-400 animate-pulse" />{" "}
              AI Chat Logs
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-full hover:bg-white/5 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="w-full py-2.5 rounded-xl border border-dashed border-blue-500/30 text-blue-500 hover:border-blue-500 hover:bg-blue-500/5 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" /> New Conversation
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-9 pr-4 text-[11px] focus:outline-none transition-all ${
                isDarkMode
                  ? "border-white/10 bg-black/40 text-white placeholder-white/20 focus:border-blue-500/50"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Chats History list */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
          {filteredChats.length > 0 ? (
            filteredChats.map((c) => {
              const isActive = selectedChatId === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => {
                    setSelectedChatId(c._id);
                    setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-inner"
                        : "bg-blue-50 border-blue-200 text-blue-600"
                      : isDarkMode
                        ? "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                        : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-500"}`}
                    />
                    <span className="text-xs font-semibold truncate block pr-2">
                      {c.title || "Untitled Chat"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, c._id)}
                    className="p-1 rounded-full text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-[10px] text-slate-400">
                No chat history found
              </p>
            </div>
          )}
        </div>

        <div
          className={`p-4 border-t border-slate-200 dark:border-white/10 ${
            isDarkMode ? "bg-black/20" : "bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow">
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate dark:text-white">
                {user?.name || "Scholar"}
              </p>
              <p className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ========================================================
         2. MAIN CHAT WINDOW WORKSPACE
         ======================================================== */}
      <main
        className={`flex-1 h-full border rounded-3xl flex flex-col justify-between overflow-hidden shadow-xl ${
          isDarkMode
            ? "border-white/10 bg-slate-900/20 backdrop-blur-xl"
            : "border-slate-200 bg-white"
        }`}
      >
        {/* Chat Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode
              ? "border-white/10 bg-black/10"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl border p-2 ${isDarkMode ? "border-blue-500/20 bg-blue-500/10 text-blue-400" : "border-blue-200 bg-blue-50 text-blue-600"}`}
            >
              <BrainCircuit className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black dark:text-white truncate max-w-sm">
                {activeChat ? activeChat.title : "LMS Pro AI Study Coach"}
              </h2>
              <p className="text-[10px] text-slate-400">
                Concept Helper & Coding Chatbot
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest border py-1.5 px-3 rounded-full bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Sparkles className="h-3 w-3 text-blue-500 animate-spin" /> Live
            Sockets
          </span>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {selectedChatId ? (
            messages.length > 0 || aiTyping || streamText ? (
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <motion.div
                      key={msg._id || index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3.5 max-w-[85%] ${isAi ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 text-xs font-bold uppercase select-none ${
                          isAi
                            ? isDarkMode
                              ? "bg-blue-500/10 border-blue-500/25 text-blue-400"
                              : "bg-blue-50 border-blue-200 text-blue-600"
                            : isDarkMode
                              ? "bg-white/5 border-white/10 text-white/50"
                              : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      >
                        {isAi ? (
                          <Cpu className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>

                      <div className="space-y-1 relative group/bubble min-w-[150px]">
                        <div
                          className={`rounded-2xl border p-4 text-xs leading-relaxed text-left relative ${
                            isAi
                              ? isDarkMode
                                ? "bg-white/5 border-white/5 text-white/85 font-medium pr-10"
                                : "bg-slate-50 border-slate-200 text-slate-700 font-medium pr-10"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white font-semibold"
                          }`}
                        >
                          {isAi ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            msg.content
                          )}

                          {isAi && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 flex gap-1 bg-slate-900/90 dark:bg-black/80 backdrop-blur-sm p-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-lg z-10">
                              <button
                                type="button"
                                onClick={() => handleCopyResponse(msg.content)}
                                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-all"
                                title="Copy response text"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              {index === messages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={handleRetry}
                                  className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-all"
                                  title="Regenerate reply"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-[9px] block px-1 ${isDarkMode ? "text-white/20" : "text-slate-400"}`}
                        >
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Real-Time Word Streaming Bubble */}
                {aiTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3.5 max-w-[85%] mr-auto text-left"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 bg-blue-500/10 border-blue-500/25 text-blue-400`}
                    >
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`rounded-2xl border p-4 text-xs leading-relaxed text-left relative ${
                          isDarkMode
                            ? "bg-white/5 border-white/5 text-white/85 font-medium"
                            : "bg-slate-50 border-slate-200 text-slate-700 font-medium"
                        }`}
                      >
                        {streamText ? (
                          <MarkdownRenderer content={streamText} />
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 font-bold">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />{" "}
                            AI Coach is thinking...
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div
                  className={`p-4 rounded-3xl border border-dashed ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}
                >
                  <BrainCircuit className="h-10 w-10 text-blue-500 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold dark:text-white">
                    Start Your Learning Session!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs px-6">
                    Ask a conceptual programming question, seek study tips, or
                    review codebase segments to unlock daily streaks!
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div
                className={`p-4 rounded-3xl border border-dashed ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}
              >
                <MessageSquare className="h-10 w-10 text-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold dark:text-white">
                  Choose or Start a Thread
                </h3>
                <p className="text-xs text-slate-400 max-w-xs px-6">
                  Select a previous conversation log from the history sidebar,
                  or trigger "New Conversation" above to start fresh.
                </p>
                <button
                  onClick={handleStartNewChat}
                  className="mt-4 px-5 py-2.5 rounded-xl text-white text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-xl shadow-blue-500/10 flex items-center gap-1 mx-auto"
                >
                  <Plus className="h-4 w-4" /> Start New Chat
                </button>
              </div>
            </div>
          )}
          <div ref={feedEndRef} />
        </div>

        {/* Floating Stop Action */}
        {aiTyping && (
          <div className="flex justify-center my-2 select-none">
            <button
              type="button"
              onClick={handleStopGeneration}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition shadow-lg backdrop-blur-md active:scale-95"
            >
              <span className="w-2.5 h-2.5 bg-rose-600 rounded-sm" />
              <span>Stop Generating</span>
            </button>
          </div>
        )}

        {/* Input Text Form */}
        <form
          onSubmit={handleSendMessage}
          className={`p-4 border-t flex gap-3 ${
            isDarkMode
              ? "border-white/5 bg-black/10"
              : "border-slate-100 bg-slate-50/50"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!selectedChatId || aiTyping}
            placeholder={
              !selectedChatId
                ? "Select a conversation to start chatting..."
                : "Ask me concepts, streak details, or write some code..."
            }
            className={`flex-1 rounded-xl border px-4 text-xs focus:outline-none transition-all ${
              isDarkMode
                ? "border-white/10 bg-black/40 text-white placeholder-white/20 focus:border-blue-500/50"
                : "border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500"
            }`}
          />
          <button
            type="submit"
            disabled={!selectedChatId || !input.trim() || aiTyping}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white hover:opacity-90 shadow-xl shadow-blue-600/25 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
