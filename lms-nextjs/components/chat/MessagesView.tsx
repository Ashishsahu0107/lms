"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function MessagesView() {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();

  const [conversations, setConversations] = useState<Array<Record<string, unknown>>>([]);
  const [activeRecipient, setActiveRecipient] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load active thread messages
  const loadThread = useCallback(async (recipientId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/messages?recipientId=${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeRecipient) {
      loadThread(activeRecipient.id as string);
    }
  }, [activeRecipient, loadThread]);

  // Listen to realtime socket messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Record<string, unknown>) => {
      if (
        activeRecipient &&
        (msg.senderId === activeRecipient.id || msg.recipientId === activeRecipient.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      loadConversations();
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-sent", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-sent", handleNewMessage);
    };
  }, [socket, activeRecipient, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRecipient) return;

    const content = inputText.trim();
    setInputText("");

    if (socket && isConnected) {
      socket.emit("send-message", {
        recipientId: activeRecipient.id,
        content,
      });
    } else {
      // Fallback HTTP POST
      fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: activeRecipient.id, content }),
      }).then(() => {
        if (activeRecipient) loadThread(activeRecipient.id as string);
      });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-base-100 rounded-2xl border border-base-200 shadow flex overflow-hidden animate-fade-in">
      {/* Conversation list */}
      <div className="w-80 border-r border-base-200 flex flex-col bg-base-100">
        <div className="p-4 border-b border-base-200">
          <h2 className="font-bold text-lg font-display">Messages 💬</h2>
          <p className="text-xs text-base-content/50">Realtime chat & discussions</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-base-200">
          {loading ? (
            <div className="p-8 text-center">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((m) => {
              const other =
                (m.sender as Record<string, unknown>)?.id === user?.id
                  ? (m.recipient as Record<string, unknown>)
                  : (m.sender as Record<string, unknown>);
              const isSelected = activeRecipient?.id === other?.id;

              return (
                <button
                  key={m.id as string}
                  onClick={() => setActiveRecipient(other || null)}
                  className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${
                    isSelected ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-base-200"
                  }`}
                >
                  <div className="avatar placeholder">
                    <div className="bg-primary/20 text-primary w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center">
                      {(other?.name as string)?.[0] || "U"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{other?.name as string || "User"}</p>
                    <p className="text-xs text-base-content/60 truncate">{m.content as string}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-base-content/40">
              No conversations yet.
            </div>
          )}
        </div>
      </div>

      {/* Chat conversation panel */}
      <div className="flex-1 flex flex-col bg-base-200/30">
        {activeRecipient ? (
          <>
            {/* Header */}
            <div className="h-16 px-6 bg-base-100 border-b border-base-200 flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary/20 text-primary w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center">
                  {(activeRecipient.name as string)?.[0] || "U"}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm">{activeRecipient.name as string}</h3>
                <span className="text-[11px] text-success">Online</span>
              </div>
            </div>

            {/* Messages stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id as string || i}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-content rounded-tr-none"
                          : "bg-base-100 text-base-content rounded-tl-none border border-base-200"
                      }`}
                    >
                      {msg.content as string}
                    </div>
                    <span className="text-[10px] text-base-content/40 mt-1 px-1">
                      {new Date(msg.createdAt as string || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-base-100 border-t border-base-200 flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1 focus:input-primary text-sm"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Send 🚀
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-base-content/40">
            <p className="text-5xl mb-3">💬</p>
            <p className="font-bold text-lg">Select a conversation</p>
            <p className="text-xs mt-1">Choose a chat from the left sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
