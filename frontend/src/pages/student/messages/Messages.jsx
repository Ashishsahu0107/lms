import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Send, Paperclip, Image, MoreVertical,
  MessageSquare, CheckCheck, Clock, User, Phone, Mail, PlusCircle, Check
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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Messages() {
  const { user: currentUser } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New Chat fields
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Typing state
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  // Load all active conversations
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

  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages for the selected conversation
  const loadMessages = async (partnerId) => {
    try {
      setLoadingMessages(true);
      const res = await apiGet(`/messages/${partnerId}`);
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Select a conversation and mark as read
  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    const partnerId = conv.participant._id;
    await loadMessages(partnerId);

    // Call API to mark as read
    try {
      await apiPatch(`/messages/read/${partnerId}`);
      // Decrement unread counts locally
      setConversations((prev) =>
        prev.map((c) =>
          c.participant._id === partnerId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  // Live Socket Event Handlers
  useEffect(() => {
    if (!socket) return;

    // 1. Receive fresh messages
    const handleNewMessage = (msg) => {
      // Determine other party's ID in this message
      const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
      const recipientId = typeof msg.recipientId === "object" ? msg.recipientId._id : msg.recipientId;
      
      const otherPartyId = senderId === currentUser.id ? recipientId : senderId;

      // Case A: Message belongs to currently open conversation
      if (selectedConv && selectedConv.participant._id === otherPartyId) {
        setMessages((prev) => [...prev, msg]);
        
        // Mark as read instantly on the backend
        if (senderId !== currentUser.id) {
          apiPatch(`/messages/read/${otherPartyId}`).catch(console.error);
        }
      }

      // Case B: Update the lastMessage and unread count in conversations sidebar
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.participant._id === otherPartyId);
        const updated = [...prev];

        if (index !== -1) {
          // Update existing conversation
          updated[index] = {
            ...updated[index],
            lastMessage: msg,
            unreadCount:
              selectedConv && selectedConv.participant._id === otherPartyId
                ? 0
                : senderId !== currentUser.id
                ? updated[index].unreadCount + 1
                : 0,
          };
        } else {
          // Fetch conversations list again to register the new contact
          loadConversations();
        }
        return updated;
      });
    };

    // 2. Outbound message confirmation
    const handleMessageSent = (msg) => {
      // Handled by handleNewMessage or API response safely
    };

    // 3. Read status receipts
    const handleMessagesRead = ({ readerId }) => {
      if (selectedConv && selectedConv.participant._id === readerId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId._id === currentUser.id || m.senderId === currentUser.id ? { ...m, read: true } : m))
        );
      }
    };

    // 4. Partner Typing indicator
    const handleUserTyping = ({ userId }) => {
      if (selectedConv && selectedConv.participant._id === userId) {
        setPartnerTyping(true);
      }
    };

    const handleUserStopTyping = ({ userId }) => {
      if (selectedConv && selectedConv.participant._id === userId) {
        setPartnerTyping(false);
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-sent", handleMessageSent);
    socket.on("messages-read", handleMessagesRead);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-sent", handleMessageSent);
      socket.off("messages-read", handleMessagesRead);
      socket.off("user-typing", handleUserTyping);
      socket.off("socket-stop-typing", handleUserStopTyping);
    };
  }, [socket, selectedConv, currentUser]);

  // Send message controller
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConv) return;
    const partnerId = selectedConv.participant._id;

    // Stop typing signal immediately
    if (isTypingRef.current) {
      socket?.emit("typing-stop", { recipientId: partnerId });
      isTypingRef.current = false;
    }

    try {
      const res = await apiPost("/messages", {
        recipientId: partnerId,
        content: messageText,
      });

      if (res.data?.success) {
        const newMsg = res.data.data;
        setMessages((prev) => [...prev, newMsg]);

        // Update sidebar conversation item
        setConversations((prev) =>
          prev.map((c) =>
            c.participant._id === partnerId
              ? { ...c, lastMessage: newMsg, unreadCount: 0 }
              : c
          )
        );
        setMessageText("");
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  // Keyboard typing handlers
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (!socket || !selectedConv) return;

    const partnerId = selectedConv.participant._id;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing-start", { recipientId: partnerId });
    }

    // Debounce the typing stop event
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { recipientId: partnerId });
      isTypingRef.current = false;
    }, 2000);
  };

  // Fetch student courses to find teachers to start new chat
  const handleOpenNewChatModal = async () => {
    setShowNewChatModal(true);
    try {
      setLoadingContacts(true);
      // Fetch student courses (which populate teachers!)
      const res = await apiGet("/student/courses");
      const courses = res.data || [];
      
      const teacherMap = new Map();
      courses.forEach((c) => {
        if (c.teacherId) {
          teacherMap.set(c.teacherId._id, c.teacherId);
        }
      });

      // Include Support contact as a default option
      const supportContact = {
        _id: "support-agent-id-placeholder",
        name: "LMS Pro Support Team",
        role: "Support",
        avatar: "",
      };

      setAvailableContacts([
        supportContact,
        ...Array.from(teacherMap.values()).map((t) => ({ ...t, role: "Instructor" })),
      ]);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleStartChatWithContact = (contact) => {
    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.participant._id === contact._id
    );

    if (existing) {
      handleSelectConversation(existing);
    } else {
      // Mock conversation item in UI
      const mockConv = {
        participant: contact,
        lastMessage: { content: "Start of your new chat history.", createdAt: new Date() },
        unreadCount: 0,
      };
      setConversations((prev) => [mockConv, ...prev]);
      setSelectedConv(mockConv);
      setMessages([]);
    }
    setShowNewChatModal(false);
  };

  const filteredConvs = conversations.filter((c) =>
    c.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversations List */}
      <motion.div variants={item} className="w-80 flex flex-col shrink-0">
        <Card className="h-full flex flex-col overflow-hidden border-muted shadow-lg">
          <CardHeader className="p-4 border-b flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Messages
              </h2>
              <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10 rounded-full" onClick={handleOpenNewChatModal}>
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9 border-muted" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                <p className="text-xs text-muted-foreground">Loading active chats...</p>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <p>No active conversations</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={handleOpenNewChatModal}>
                  Start Chatting
                </Button>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const isUserOnline = onlineUsers.has(conv.participant?._id) || conv.participant?.isOnline;
                return (
                  <button
                    key={conv.participant?._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-primary/5 transition-all text-left border-b border-muted/50 ${selectedConv?.participant?._id === conv.participant?._id ? "bg-primary/10 border-l-4 border-l-primary" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-10 h-10 border border-muted">
                        <AvatarImage src={conv.participant?.avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary">{conv.participant?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isUserOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm truncate">{conv.participant?.name}</p>
                        <p className="text-[10px] text-muted-foreground shrink-0">
                          {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </p>
                      </div>
                      <p className={`text-xs truncate mt-1 ${conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {conv.lastMessage?.content || "Tap to chat..."}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shrink-0 font-bold ml-1 animate-pulse">
                        {conv.unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Card>
      </motion.div>

      {/* Chat Window */}
      <motion.div variants={item} className="flex-1 flex flex-col">
        {selectedConv ? (
          <Card className="h-full flex flex-col overflow-hidden border-muted shadow-lg">
            {/* Chat Header */}
            <CardHeader className="p-4 border-b flex-row items-center gap-3 shrink-0">
              <div className="relative">
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src={selectedConv.participant?.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary">{selectedConv.participant?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {(onlineUsers.has(selectedConv.participant?._id) || selectedConv.participant?.isOnline) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{selectedConv.participant?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedConv.participant?.role || "Contact"} · {(onlineUsers.has(selectedConv.participant?._id) || selectedConv.participant?.isOnline) ? "Online" : "Offline"}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4" /></Button>
            </CardHeader>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary/5">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                  <p className="text-xs text-muted-foreground">Loading chat history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-6 space-y-2">
                  <MessageSquare className="h-10 w-10 text-primary/30" />
                  <p className="text-sm font-medium">Say hello!</p>
                  <p className="text-xs text-muted-foreground/80">Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = (msg.senderId?._id || msg.senderId) === currentUser.id;
                  const senderName = msg.senderId?.name || selectedConv.participant?.name;
                  return (
                    <div key={msg._id || Math.random()} className={`flex gap-2.5 ${isMe ? "justify-end" : ""}`}>
                      {!isMe && (
                        <Avatar className="w-8 h-8 border shrink-0">
                          <AvatarImage src={selectedConv.participant?.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary">{selectedConv.participant?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] ${isMe ? "order-1" : ""}`}>
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-muted rounded-tl-none"}`}>
                          <p>{msg.content}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1 select-none">
                          {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            <CheckCheck className={`h-3.5 w-3.5 ${msg.read ? "text-primary" : "text-muted-foreground"}`} />
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {partnerTyping && (
                <div className="flex gap-2.5 items-center">
                  <Avatar className="w-8 h-8 border shrink-0">
                    <AvatarImage src={selectedConv.participant?.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">{selectedConv.participant?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-card border border-muted px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5 h-9 shrink-0">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-4 border-t bg-card shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"><Paperclip className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"><Image className="h-4 w-4" /></Button>
                <Input
                  className="flex-1 border-muted focus-visible:ring-primary h-10 text-sm rounded-xl"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button
                  size="icon"
                  className="rounded-full h-10 w-10 shadow-md transition-all active:scale-95"
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Your Inbox"
            description="Select a chat from the sidebar or start a new conversation with your instructor."
            action={{ label: "New Message", onClick: handleOpenNewChatModal }}
            className="h-full border border-muted shadow-lg"
          />
        )}
      </motion.div>

      {/* New Chat Modal Dialog overlay */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-2xl border border-muted p-6 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">New Conversation</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowNewChatModal(false)}>Close</Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mt-2">
                {loadingContacts ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    <p className="text-xs text-muted-foreground">Loading instructors...</p>
                  </div>
                ) : availableContacts.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No available contacts found.</p>
                ) : (
                  availableContacts.map((contact) => (
                    <button
                      key={contact._id}
                      onClick={() => handleStartChatWithContact(contact)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 rounded-xl transition-all text-left border border-muted/30"
                    >
                      <Avatar className="w-10 h-10 border">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary">{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}