import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Send, Paperclip, Image, MoreVertical, Search as SearchIcon,
  MessageSquare, CheckCheck, Clock, User, Phone, Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { EmptyState } from "../../../components/ui/EmptyState";

const conversations = [
  {
    id: 1,
    name: "Dr. James Wilson",
    role: "Instructor",
    avatar: "",
    lastMessage: "Great progress on the assignment! Keep it up.",
    time: "2 hours ago",
    unread: 2,
    online: true,
    messages: [
      { id: 1, sender: "them", text: "Hi Sarah! How is the JavaScript course going?", time: "10:30 AM" },
      { id: 2, sender: "me", text: "Going really well! I just finished the Async module.", time: "10:45 AM" },
      { id: 3, sender: "them", text: "Excellent! The async patterns are tricky at first but you're handling them well.", time: "10:47 AM" },
      { id: 4, sender: "them", text: "Great progress on the assignment! Keep it up.", time: "10:48 AM" },
    ]
  },
  {
    id: 2,
    name: "Prof. Emily Chen",
    role: "Instructor",
    avatar: "",
    lastMessage: "Your quiz results are in. You scored 92%!",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      { id: 1, sender: "them", text: "I've posted the new assignment for Python course.", time: "Yesterday 2:00 PM" },
      { id: 2, sender: "me", text: "Thank you! I'll start working on it right away.", time: "Yesterday 2:30 PM" },
      { id: 3, sender: "them", text: "Your quiz results are in. You scored 92%!", time: "Yesterday 5:00 PM" },
    ]
  },
  {
    id: 3,
    name: "Student Support",
    role: "Support",
    avatar: "",
    lastMessage: "We're here to help if you need anything.",
    time: "3 days ago",
    unread: 0,
    online: true,
    messages: [
      { id: 1, sender: "me", text: "I had an issue with the video player. It's buffering a lot.", time: "3 days ago" },
      { id: 2, sender: "them", text: "Sorry to hear that! We're looking into server performance.", time: "3 days ago" },
      { id: 3, sender: "them", text: "We're here to help if you need anything.", time: "3 days ago" },
    ]
  }
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Messages() {
  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");

  const filteredConvs = conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sendMessage = () => {
    if (!messageText.trim()) return;
    const updated = { ...selectedConv, messages: [...selectedConv.messages, { id: Date.now(), sender: "me", text: messageText, time: "Just now" }] };
    setSelectedConv(updated);
    setMessageText("");
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversations List */}
      <motion.div variants={item} className="w-80 flex flex-col shrink-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Messages</h2>
              <Badge variant="secondary">{conversations.reduce((a, c) => a + c.unread, 0)}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Search messages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b ${selectedConv.id === conv.id ? "bg-muted" : ""}`}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10" src={conv.avatar} fallback={conv.name.charAt(0)} />
                  {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm truncate">{conv.name}</p>
                    <p className="text-xs text-muted-foreground shrink-0">{conv.time}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">{conv.unread}</div>}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Chat Window */}
      <motion.div variants={item} className="flex-1 flex flex-col">
        <Card className="h-full flex flex-col">
          {/* Chat Header */}
          <CardHeader className="p-4 border-b flex-row items-center gap-3">
            <Avatar className="w-10 h-10" src={selectedConv.avatar} fallback={selectedConv.name.charAt(0)} />
            <div className="flex-1">
              <p className="font-semibold">{selectedConv.name}</p>
              <p className="text-xs text-muted-foreground">{selectedConv.role} · {selectedConv.online ? "Online" : "Offline"}</p>
            </div>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </CardHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedConv.messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender === "me" ? "justify-end" : ""}`}>
                {msg.sender !== "me" && <Avatar className="w-8 h-8 shrink-0" fallback={selectedConv.name.charAt(0)} />}
                <div className={`max-w-[70%] ${msg.sender === "me" ? "order-1" : ""}`}>
                  <div className={`rounded-2xl px-4 py-2.5 ${msg.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {msg.sender === "me" && <CheckCheck className="h-3 w-3" />}
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Image className="h-4 w-4" /></Button>
              <Input
                className="flex-1"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage} disabled={!messageText.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}