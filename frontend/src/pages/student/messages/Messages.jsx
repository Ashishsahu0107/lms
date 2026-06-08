import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Send, Paperclip, Image, MoreVertical,
  MessageSquare, CheckCheck, Clock, User, Phone, Mail, PlusCircle, Check, Download, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/Avatar";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import { apiGet, apiPost, apiPatch } from "../../../services/apiClient";
import toast from "react-hot-toast";

// =====================================
// CUSTOM AUDIO / VOICE NOTE PLAYER
// =====================================
function VoiceNotePlayer({ src }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
    const audio = audioRef.current;
    
    const onTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };
    
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const seekTime = (e.target.value / 100) * duration;
    audio.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex items-center gap-3 bg-base-200/60 p-2.5 rounded-xl border border-base-300 w-64 mt-1 select-none">
      <button
        onClick={togglePlay}
        className="h-8 w-8 rounded-full bg-primary text-primary-content flex items-center justify-center cursor-pointer shrink-0 transition-transform active:scale-95"
      >
        {isPlaying ? (
          <span className="flex gap-0.5 justify-center">
            <span className="w-1 h-3.5 bg-current rounded-full" />
            <span className="w-1 h-3.5 bg-current rounded-full" />
          </span>
        ) : (
          <span className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-current ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="range range-xs range-primary w-full cursor-pointer h-1.5 bg-base-300 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-base-content/60 mt-1">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Messages() {
  const { user: currentUser } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null); // { type: 'direct'|'group', id, participant|name, avatar }
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Tabs
  const [activeSidebarTab, setActiveSidebarTab] = useState("direct"); // "direct" | "group"

  // Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("direct"); // "direct" | "group"
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Group Form
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

  // Attachment Form
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Typing
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // `${groupId}:${userId}` -> boolean
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping, typingUsers]);

  // Recording Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const loadConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await apiGet("/messages/conversations");
      if (res.data?.success) {
        setConversations(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await apiGet("/messages/groups");
      if (res.data?.success) {
        setGroups(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load groups:", err);
    }
  };

  useEffect(() => {
    loadConversations();
    loadGroups();
  }, []);

  const handleSelectConversation = async (conv) => {
    setSelectedConv({
      type: "direct",
      id: conv.participant._id,
      participant: conv.participant,
    });
    setPartnerTyping(false);

    try {
      setLoadingMessages(true);
      const res = await apiGet(`/messages/${conv.participant._id}`);
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
      // Clear Read Receipt
      await apiPatch(`/messages/read/${conv.participant._id}`);
      setConversations((prev) =>
        prev.map((c) =>
          c.participant?._id === conv.participant._id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedConv({
      type: "group",
      id: group._id,
      name: group.name,
      description: group.description,
      members: group.members,
      avatar: group.avatar,
    });

    try {
      setLoadingMessages(true);
      const res = await apiGet(`/messages/group/${group._id}`);
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load group messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Live Socket integration
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (selectedConv) {
        if (selectedConv.type === "group" && msg.groupId === selectedConv.id) {
          setMessages((prev) => [...prev, msg]);
        } else if (selectedConv.type === "direct" && !msg.groupId) {
          const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
          const recipientId = typeof msg.recipientId === "object" ? msg.recipientId._id : msg.recipientId;
          const partnerId = senderId === currentUser.id ? recipientId : senderId;

          if (selectedConv.id === partnerId) {
            setMessages((prev) => [...prev, msg]);
            if (senderId !== currentUser.id) {
              apiPatch(`/messages/read/${partnerId}`).catch(console.error);
            }
          } else {
            loadConversations();
          }
        } else {
          if (msg.groupId) loadGroups();
          else loadConversations();
        }
      } else {
        if (msg.groupId) loadGroups();
        else loadConversations();
      }
    };

    const handleMessageReceived = (msg) => {
      handleNewMessage(msg);
    };

    const handleMessageSent = (msg) => {
      // Handled by handleNewMessage or API response safely
    };

    const handleMessagesRead = ({ readerId }) => {
      if (selectedConv && selectedConv.type === "direct" && selectedConv.id === readerId) {
        setMessages((prev) =>
          prev.map((m) =>
            (m.senderId?._id || m.senderId) === currentUser.id ? { ...m, read: true } : m
          )
        );
      }
    };

    const handleUserTyping = (data) => {
      const { userId, isTyping, groupId } = data;
      if (selectedConv) {
        if (selectedConv.type === "group" && groupId === selectedConv.id) {
          setTypingUsers((prev) => {
            const updated = { ...prev };
            const key = `${groupId}:${userId}`;
            if (isTyping) {
              updated[key] = true;
            } else {
              delete updated[key];
            }
            return updated;
          });
        } else if (selectedConv.type === "direct" && selectedConv.id === userId && !groupId) {
          setPartnerTyping(isTyping);
        }
      }
    };

    const handleLegacyUserTyping = ({ userId }) => {
      if (selectedConv && selectedConv.type === "direct" && selectedConv.id === userId) {
        setPartnerTyping(true);
      }
    };

    const handleLegacyUserStopTyping = ({ userId }) => {
      if (selectedConv && selectedConv.type === "direct" && selectedConv.id === userId) {
        setPartnerTyping(false);
      }
    };

    socket.on("messageReceived", handleMessageReceived);
    socket.on("new-message", handleNewMessage);
    socket.on("newMessage", handleNewMessage);
    socket.on("message-sent", handleMessageSent);
    socket.on("messages-read", handleMessagesRead);
    socket.on("userTyping", handleUserTyping);
    socket.on("user-typing", handleLegacyUserTyping);
    socket.on("user-stop-typing", handleLegacyUserStopTyping);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("new-message", handleNewMessage);
      socket.off("newMessage", handleNewMessage);
      socket.off("message-sent", handleMessageSent);
      socket.off("messages-read", handleMessagesRead);
      socket.off("userTyping", handleUserTyping);
      socket.off("user-typing", handleLegacyUserTyping);
      socket.off("user-stop-typing", handleLegacyUserStopTyping);
    };
  }, [socket, selectedConv, currentUser]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (!socket || !selectedConv) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      const typePayload = selectedConv.type === "group" 
        ? { groupId: selectedConv.id, isTyping: true }
        : { recipientId: selectedConv.id, isTyping: true };
      
      socket.emit("userTyping", typePayload);
      socket.emit("typing-start", selectedConv.type === "group" ? { groupId: selectedConv.id } : { recipientId: selectedConv.id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      const typeStopPayload = selectedConv.type === "group" 
        ? { groupId: selectedConv.id, isTyping: false }
        : { recipientId: selectedConv.id, isTyping: false };
      
      socket.emit("userTyping", typeStopPayload);
      socket.emit("typing-stop", selectedConv.type === "group" ? { groupId: selectedConv.id } : { recipientId: selectedConv.id });
      isTypingRef.current = false;
    }, 2000);
  };

  // Upload attachment file handler
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);

      toast.loading("Uploading attachment...", { id: "upload" });
      const res = await apiPost("/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        toast.success("Attachment ready!", { id: "upload" });
        setPendingAttachment(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed", { id: "upload" });
    } finally {
      setUploadingFile(false);
    }
  };

  // Voice Note Recorder Trigger
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceNote = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `voice_note_${Date.now()}.webm`);
      
      toast.loading("Sending voice note...", { id: "voice" });
      
      const uploadRes = await apiPost("/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (uploadRes.data?.success) {
        const attachment = uploadRes.data.data;
        
        let res;
        if (selectedConv.type === "group") {
          res = await apiPost(`/messages/group/${selectedConv.id}`, {
            content: "",
            attachments: [attachment]
          });
        } else {
          res = await apiPost("/messages", {
            recipientId: selectedConv.id,
            content: "",
            attachments: [attachment]
          });
        }
        
        if (res.data?.success) {
          toast.success("Voice note sent!", { id: "voice" });
          const newMsg = res.data.data;
          setMessages((prev) => [...prev, newMsg]);
          if (selectedConv.type === "group") loadGroups();
          else loadConversations();
        }
      }
    } catch (err) {
      toast.error("Failed to send voice note", { id: "voice" });
    }
  };

  // Main sendMessage trigger
  const sendMessage = async () => {
    if ((!messageText.trim() && !pendingAttachment) || !selectedConv) return;

    if (isTypingRef.current) {
      const typeStopPayload = selectedConv.type === "group" 
        ? { groupId: selectedConv.id, isTyping: false }
        : { recipientId: selectedConv.id, isTyping: false };
      
      socket?.emit("userTyping", typeStopPayload);
      socket?.emit("typing-stop", selectedConv.type === "group" ? { groupId: selectedConv.id } : { recipientId: selectedConv.id });
      isTypingRef.current = false;
    }

    try {
      let res;
      if (selectedConv.type === "group") {
        res = await apiPost(`/messages/group/${selectedConv.id}`, {
          content: messageText,
          attachments: pendingAttachment ? [pendingAttachment] : [],
        });
      } else {
        res = await apiPost("/messages", {
          recipientId: selectedConv.id,
          content: messageText,
          attachments: pendingAttachment ? [pendingAttachment] : [],
        });
      }

      if (res.data?.success) {
        const newMsg = res.data.data;
        setMessages((prev) => [...prev, newMsg]);
        setMessageText("");
        setPendingAttachment(null);
        
        if (selectedConv.type === "group") loadGroups();
        else loadConversations();
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleOpenNewChatModal = async () => {
    setShowNewChatModal(true);
    try {
      setLoadingContacts(true);
      let list = [];
      if (currentUser.role === "student") {
        const res = await apiGet("/student/courses");
        const courses = res.data || [];
        const teacherMap = new Map();
        courses.forEach((c) => {
          if (c.teacherId) {
            teacherMap.set(c.teacherId._id, c.teacherId);
          }
        });
        list = Array.from(teacherMap.values()).map((t) => ({ ...t, role: "Instructor" }));
      } else {
        const res = await apiGet("/teacher/students");
        const students = res.data || [];
        list = students.map((s) => ({ ...s, role: "Student" }));
      }

      const supportContact = {
        _id: "support-agent-id-placeholder",
        name: "LMS Pro Support Team",
        role: "Support",
        avatar: "",
      };

      setAvailableContacts([supportContact, ...list]);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleStartChatWithContact = (contact) => {
    const existing = conversations.find(
      (c) => c.participant?._id === contact._id
    );

    if (existing) {
      handleSelectConversation(existing);
    } else {
      const mockConv = {
        participant: contact,
        lastMessage: { content: "Start of your new chat history.", createdAt: new Date() },
        unreadCount: 0,
      };
      setConversations((prev) => [mockConv, ...prev]);
      setSelectedConv({
        type: "direct",
        id: contact._id,
        participant: contact,
      });
      setMessages([]);
    }
    setShowNewChatModal(false);
  };

  const handleToggleGroupMember = (uid) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedGroupMembers.length === 0) {
      toast.error("Select at least one member");
      return;
    }

    try {
      const res = await apiPost("/messages/groups", {
        name: groupName,
        description: groupDesc,
        members: selectedGroupMembers,
      });

      if (res.data?.success) {
        toast.success("Group created successfully!");
        setShowNewChatModal(false);
        setGroupName("");
        setGroupDesc("");
        setSelectedGroupMembers([]);
        loadGroups();
      }
    } catch (err) {
      toast.error("Failed to create group chat");
    }
  };

  const getGroupTypingText = () => {
    if (!selectedConv || selectedConv.type !== "group") return "";
    const typers = [];
    Object.keys(typingUsers).forEach((key) => {
      const [gId, uId] = key.split(":");
      if (gId === selectedConv.id) {
        const m = selectedConv.members?.find((member) => (member._id || member) === uId);
        if (m && typeof m === "object") {
          typers.push(m.name);
        } else {
          typers.push("Someone");
        }
      }
    });

    if (typers.length === 0) return "";
    if (typers.length === 1) return `${typers[0]} is typing...`;
    return "Multiple people are typing...";
  };

  const filteredConvs = conversations.filter((c) =>
    c.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="h-[calc(100vh-8rem)] flex gap-6">
      
      {/* Conversations Sidebar */}
      <motion.div variants={item} className="w-80 flex flex-col shrink-0">
        <Card className="h-full flex flex-col overflow-hidden border-base-300 shadow-xl bg-base-100">
          
          <CardHeader className="p-4 border-b border-base-300 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
                <MessageSquare className="h-5 w-5 text-primary" /> Inbox
              </h2>
              <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10 rounded-full" onClick={handleOpenNewChatModal}>
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
              <Input className="pl-9 h-9 border-base-300 bg-base-200/50" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-base-300 text-xs font-bold text-center">
            <button
              onClick={() => setActiveSidebarTab("direct")}
              className={`flex-1 py-3.5 border-b-2 transition-all cursor-pointer ${activeSidebarTab === "direct" ? "border-primary text-primary bg-primary/5" : "border-transparent text-base-content/60 hover:bg-base-200/50"}`}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveSidebarTab("group")}
              className={`flex-1 py-3.5 border-b-2 transition-all cursor-pointer ${activeSidebarTab === "group" ? "border-primary text-primary bg-primary/5" : "border-transparent text-base-content/60 hover:bg-base-200/50"}`}
            >
              Groups ({groups.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {activeSidebarTab === "direct" ? (
              loadingConvs ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2">
                  <span className="loading loading-spinner text-primary" />
                  <p className="text-xs text-base-content/60">Loading direct chats...</p>
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="p-6 text-center text-xs text-base-content/50">No chats found.</div>
              ) : (
                filteredConvs.map((conv) => {
                  const partner = conv.participant;
                  if (!partner) return null;
                  const isUserOnline = onlineUsers.has(partner._id) || partner.isOnline;
                  const active = selectedConv?.type === "direct" && selectedConv.id === partner._id;
                  
                  return (
                    <button
                      key={partner._id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full flex items-start gap-3 p-4 hover:bg-base-200/50 transition-all text-left border-b border-base-300/40 cursor-pointer ${active ? "bg-primary/10 border-l-4 border-l-primary" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-10 h-10 border border-base-300">
                          <AvatarImage src={partner.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary">{partner.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isUserOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-base-100 shadow-sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm truncate text-base-content">{partner.name}</p>
                          <p className="text-[10px] text-base-content/50 shrink-0">
                            {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </p>
                        </div>
                        <p className={`text-xs truncate mt-1 ${conv.unreadCount > 0 ? "font-bold text-base-content" : "text-base-content/60"}`}>
                          {conv.lastMessage?.content || "Tap to chat..."}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-content text-[10px] flex items-center justify-center shrink-0 font-bold ml-1 animate-pulse">
                          {conv.unreadCount}
                        </div>
                      )}
                    </button>
                  );
                })
              )
            ) : (
              // Groups
              filteredGroups.length === 0 ? (
                <div className="p-6 text-center text-xs text-base-content/50 flex flex-col items-center gap-2">
                  <p>No active groups.</p>
                  <Button size="sm" variant="outline" onClick={handleOpenNewChatModal}>Create Group</Button>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const active = selectedConv?.type === "group" && selectedConv.id === group._id;
                  return (
                    <button
                      key={group._id}
                      onClick={() => handleSelectGroup(group)}
                      className={`w-full flex items-start gap-3 p-4 hover:bg-base-200/50 transition-all text-left border-b border-base-300/40 cursor-pointer ${active ? "bg-primary/10 border-l-4 border-l-primary" : ""}`}
                    >
                      <Avatar className="w-10 h-10 border border-base-300 shrink-0">
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback className="bg-secondary/20 text-secondary">{group.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-base-content">{group.name}</p>
                        <p className="text-xs truncate text-base-content/60 mt-1">{group.description || "Group chat thread"}</p>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </Card>
      </motion.div>

      {/* Chat Window */}
      <motion.div variants={item} className="flex-1 flex flex-col">
        {selectedConv ? (
          <Card className="h-full flex flex-col overflow-hidden border-base-300 shadow-xl bg-base-100">
            
            {/* Header */}
            <CardHeader className="p-4 border-b border-base-300 flex-row items-center gap-3 shrink-0 bg-base-200/20">
              <div className="relative">
                <Avatar className="w-10 h-10 border border-base-300">
                  <AvatarImage src={selectedConv.avatar || selectedConv.participant?.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {selectedConv.type === "group" ? selectedConv.name?.charAt(0) : selectedConv.participant?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {selectedConv.type === "direct" && (onlineUsers.has(selectedConv.id) || selectedConv.participant?.isOnline) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-base-100" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-base-content truncate">
                  {selectedConv.type === "group" ? selectedConv.name : selectedConv.participant?.name}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  {selectedConv.type === "group" ? (
                    getGroupTypingText() || `${selectedConv.members?.length || 0} members`
                  ) : (
                    partnerTyping ? "Typing..." : (onlineUsers.has(selectedConv.id) || selectedConv.participant?.isOnline ? "Online" : "Offline")
                  )}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4 text-base-content" /></Button>
            </CardHeader>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/30 scrollbar-thin">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <span className="loading loading-spinner text-primary" />
                  <p className="text-xs text-base-content/60">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <MessageSquare className="h-10 w-10 text-primary/30" />
                  <p className="text-sm font-semibold text-base-content">Start Chatting</p>
                  <p className="text-xs text-base-content/60">Send a greeting message to open the dialog.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = (msg.senderId?._id || msg.senderId) === currentUser.id;
                  const senderName = msg.senderId?.name || "Member";
                  return (
                    <div key={msg._id || index} className={`flex gap-3 ${isMe ? "justify-end" : ""}`}>
                      {!isMe && (
                        <Avatar className="w-8 h-8 border border-base-300 shrink-0">
                          <AvatarImage src={msg.senderId?.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary">{senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] ${isMe ? "order-1" : ""}`}>
                        {selectedConv.type === "group" && !isMe && (
                          <span className="text-[10px] text-base-content/50 block mb-1 font-semibold ml-1">{senderName}</span>
                        )}
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isMe ? "bg-primary text-primary-content rounded-tr-none" : "bg-base-100 border border-base-300 rounded-tl-none text-base-content"}`}>
                          {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                          
                          {/* Attachments rendering */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((att, attIdx) => {
                                if (att.type === "image") {
                                  return (
                                    <img
                                      key={attIdx}
                                      src={att.url}
                                      alt={att.fileName || "Uploaded Image"}
                                      className="max-w-xs rounded-xl border border-base-300 shadow-md max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(att.url, "_blank")}
                                    />
                                  );
                                }
                                if (att.type === "audio") {
                                  return <VoiceNotePlayer key={attIdx} src={att.url} />;
                                }
                                return (
                                  <a
                                    key={attIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-2.5 rounded-xl border bg-base-200/50 hover:bg-base-200 border-base-300 text-xs text-primary font-semibold w-fit max-w-xs shrink-0"
                                  >
                                    <Paperclip className="h-4 w-4 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-base-content font-bold">{att.fileName}</p>
                                      <p className="text-[9px] text-base-content/50">
                                        {att.fileSize ? (att.fileSize / 1024 / 1024).toFixed(2) + " MB" : "Unknown size"}
                                      </p>
                                    </div>
                                    <Download className="h-4 w-4 text-base-content/40" />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] text-base-content/50 mt-1 flex items-center justify-end gap-1">
                          {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            <CheckCheck className={`h-3.5 w-3.5 ${msg.read ? "text-primary" : "text-base-content/30"}`} />
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Personal typing bubble */}
              {selectedConv.type === "direct" && partnerTyping && (
                <div className="flex gap-2.5 items-center">
                  <Avatar className="w-8 h-8 border border-base-300 shrink-0">
                    <AvatarImage src={selectedConv.participant?.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">{selectedConv.participant?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-base-100 border border-base-300 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5 h-9 shrink-0">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Bar */}
            <div className="p-4 border-t border-base-300 bg-base-100 shrink-0 flex flex-col gap-2">
              
              {pendingAttachment && (
                <div className="flex items-center justify-between bg-primary/5 p-2 px-3 rounded-xl border border-primary/20 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="truncate text-base-content font-bold">{pendingAttachment.fileName}</span>
                  </div>
                  <button onClick={() => setPendingAttachment(null)} className="text-error text-xs font-bold hover:underline cursor-pointer">
                    Remove
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                
                {/* File picker */}
                <label className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 text-base-content/60 hover:text-primary cursor-pointer flex items-center justify-center shrink-0">
                  <Paperclip className="h-4 w-4" />
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.zip,.rar,.txt,.pptx" />
                </label>

                {/* Image picker */}
                <label className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 text-base-content/60 hover:text-primary cursor-pointer flex items-center justify-center shrink-0">
                  <Image className="h-4 w-4" />
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>

                {isRecording ? (
                  <div className="flex-1 flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-red-500 text-xs font-semibold animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <div className="flex gap-0.5 items-center">
                      <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Recording Voice Note: {formatDuration(recordingDuration)}</span>
                    <button onClick={stopRecording} className="ml-auto bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-all text-[10px] cursor-pointer">
                      Stop & Send
                    </button>
                  </div>
                ) : (
                  <>
                    <Input
                      className="flex-1 border-base-300 focus-visible:ring-primary h-10 text-sm rounded-xl bg-base-200/50"
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    
                    <button
                      onClick={startRecording}
                      className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 text-base-content/60 hover:text-primary flex items-center justify-center shrink-0 cursor-pointer"
                      title="Record Voice Note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </button>
                  </>
                )}

                <Button
                  size="icon"
                  className="rounded-full h-10 w-10 shadow-md transition-all active:scale-95 btn-primary text-primary-content"
                  onClick={sendMessage}
                  disabled={uploadingFile || (!messageText.trim() && !pendingAttachment)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </Card>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Secure Messaging Cockpit"
            description="Select an instructor or group thread from the sidebar or click '+' to build a new connection."
            action={{ label: "New Message", onClick: handleOpenNewChatModal }}
            className="h-full border border-base-300 shadow-xl bg-base-100"
          />
        )}
      </motion.div>

      {/* Modal dialog for starting new chat or creating groups */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-base-100 w-full max-w-md rounded-2xl border border-base-300 p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-base-content">New Conversation</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowNewChatModal(false)}>Close</Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-base-300 mb-4 text-xs font-bold text-center">
                <button
                  onClick={() => setActiveModalTab("direct")}
                  className={`flex-1 pb-3.5 border-b-2 transition-all cursor-pointer ${activeModalTab === "direct" ? "border-primary text-primary" : "border-transparent text-base-content/60"}`}
                >
                  Direct Message
                </button>
                <button
                  onClick={() => setActiveModalTab("group")}
                  className={`flex-1 pb-3.5 border-b-2 transition-all cursor-pointer ${activeModalTab === "group" ? "border-primary text-primary" : "border-transparent text-base-content/60"}`}
                >
                  Group Chat
                </button>
              </div>

              {activeModalTab === "direct" ? (
                // Direct Chat
                <div className="flex-1 overflow-y-auto space-y-2 mt-2 scrollbar-thin">
                  {loadingContacts ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                      <span className="loading loading-spinner text-primary" />
                      <p className="text-xs text-base-content/60">Loading contacts...</p>
                    </div>
                  ) : availableContacts.length === 0 ? (
                    <p className="text-center text-sm text-base-content/60 py-8">No contacts available.</p>
                  ) : (
                    availableContacts.map((contact) => (
                      <button
                        key={contact._id}
                        onClick={() => handleStartChatWithContact(contact)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-base-200/60 rounded-xl transition-all text-left border border-base-300/40 cursor-pointer"
                      >
                        <Avatar className="w-10 h-10 border border-base-300">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary">{contact.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-base-content">{contact.name}</p>
                          <p className="text-xs text-base-content/50">{contact.role}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // Group Chat Form
                <div className="flex-1 overflow-y-auto space-y-4 mt-2 pr-1 scrollbar-thin">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content/70">Group Name</label>
                    <Input className="border-base-300" placeholder="e.g. Study Circle" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content/70">Description</label>
                    <Input className="border-base-300" placeholder="Describe the group scope..." value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-content/70 block">Select Group Members</label>
                    <div className="space-y-1 max-h-48 overflow-y-auto border border-base-300 p-2 rounded-xl bg-base-200/30 scrollbar-thin">
                      {loadingContacts ? (
                        <div className="text-center py-6 text-xs text-base-content/60">Loading...</div>
                      ) : availableContacts.filter(c => c._id !== "support-agent-id-placeholder").length === 0 ? (
                        <div className="text-center py-6 text-xs text-base-content/60">No available members.</div>
                      ) : (
                        availableContacts
                          .filter(c => c._id !== "support-agent-id-placeholder")
                          .map((contact) => (
                            <label key={contact._id} className="flex items-center gap-3 p-2 hover:bg-base-200/50 rounded-lg cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm rounded-md"
                                checked={selectedGroupMembers.includes(contact._id)}
                                onChange={() => handleToggleGroupMember(contact._id)}
                              />
                              <Avatar className="w-8 h-8 border border-base-300 shrink-0">
                                <AvatarFallback className="bg-secondary/20 text-secondary">{contact.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-base-content">{contact.name}</span>
                            </label>
                          ))
                      )}
                    </div>
                  </div>

                  <Button className="w-full mt-4 btn-primary text-primary-content" onClick={handleCreateGroupChat}>
                    Create Group Chat
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}