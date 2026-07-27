import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../../services/apiClient";

export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGet("/messages/conversations");
      if (res.data?.success) {
        return res.data.data;
      }
      return rejectWithValue(
        res.data?.message || "Failed to fetch conversations",
      );
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch conversations",
      );
    }
  },
);

export const fetchGroups = createAsyncThunk(
  "messages/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGet("/messages/groups");
      if (res.data?.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data?.message || "Failed to fetch groups");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch groups",
      );
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (otherId, { rejectWithValue }) => {
    try {
      const res = await apiGet(`/messages/${otherId}`);
      if (res.data?.success) {
        return { otherId, messages: res.data.data };
      }
      return rejectWithValue(res.data?.message || "Failed to fetch messages");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch messages",
      );
    }
  },
);

export const fetchGroupMessages = createAsyncThunk(
  "messages/fetchGroupMessages",
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await apiGet(`/messages/group/${groupId}`);
      if (res.data?.success) {
        return { groupId, messages: res.data.data };
      }
      return rejectWithValue(
        res.data?.message || "Failed to fetch group messages",
      );
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch group messages",
      );
    }
  },
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ recipientId, content, attachments }, { rejectWithValue }) => {
    try {
      const res = await apiPost("/messages", {
        recipientId,
        content,
        attachments,
      });
      if (res.data?.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data?.message || "Failed to send message");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send message",
      );
    }
  },
);

export const sendGroupMessage = createAsyncThunk(
  "messages/sendGroupMessage",
  async ({ groupId, content, attachments }, { rejectWithValue }) => {
    try {
      const res = await apiPost(`/messages/group/${groupId}`, {
        content,
        attachments,
      });
      if (res.data?.success) {
        return res.data.data;
      }
      return rejectWithValue(
        res.data?.message || "Failed to send group message",
      );
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send group message",
      );
    }
  },
);

export const createGroup = createAsyncThunk(
  "messages/createGroup",
  async ({ name, description, members }, { rejectWithValue }) => {
    try {
      const res = await apiPost("/messages/groups", {
        name,
        description,
        members,
      });
      if (res.data?.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data?.message || "Failed to create group");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create group",
      );
    }
  },
);

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    conversations: [],
    groups: [],
    messages: [],
    activeChat: null, // { id, type: 'user' | 'group' }
    loadingConvs: false,
    loadingGroups: false,
    loadingMessages: false,
    typingUsers: {}, // { partnerId: boolean or `${groupId}:${userId}`: boolean }
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload; // { id, type }
      state.messages = [];
    },
    receiveMessage: (state, action) => {
      const msg = action.payload;
      const { activeChat } = state;

      // Determine if message belongs to active chat
      if (activeChat) {
        if (activeChat.type === "group" && msg.groupId === activeChat.id) {
          state.messages.push(msg);
        } else if (activeChat.type === "user") {
          const isDirectMatch =
            (msg.senderId?._id || msg.senderId) === activeChat.id ||
            (msg.recipientId?._id || msg.recipientId) === activeChat.id;
          if (isDirectMatch && !msg.groupId) {
            state.messages.push(msg);
          }
        }
      }

      // Update conversations sidebar last message
      if (msg.groupId) {
        const groupIndex = state.groups.findIndex((g) => g._id === msg.groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].updatedAt = msg.createdAt;
        }
      } else {
        const senderId = msg.senderId?._id || msg.senderId;
        const recipientId = msg.recipientId?._id || msg.recipientId;
        const partnerId = senderId === activeChat?.id ? recipientId : senderId;

        state.conversations = state.conversations.map((c) => {
          if (c.participant?._id === partnerId) {
            return {
              ...c,
              lastMessage: msg,
              unreadCount:
                activeChat && activeChat.id === partnerId
                  ? 0
                  : c.unreadCount + 1,
            };
          }
          return c;
        });
      }
    },
    setTypingStatus: (state, action) => {
      const { userId, groupId, isTyping } = action.payload;
      const key = groupId ? `${groupId}:${userId}` : userId;
      if (isTyping) {
        state.typingUsers[key] = true;
      } else {
        delete state.typingUsers[key];
      }
    },
    clearUnreadCount: (state, action) => {
      const partnerId = action.payload;
      state.conversations = state.conversations.map((c) =>
        c.participant?._id === partnerId ? { ...c, unreadCount: 0 } : c,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loadingConvs = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loadingConvs = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.loadingConvs = false;
      })
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loadingGroups = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loadingGroups = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state) => {
        state.loadingGroups = false;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loadingMessages = false;
      })
      // Fetch Group Messages
      .addCase(fetchGroupMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchGroupMessages.rejected, (state) => {
        state.loadingMessages = false;
      })
      // Send Message / Send Group Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      // Create Group
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.unshift(action.payload);
      });
  },
});

export const {
  setActiveChat,
  receiveMessage,
  setTypingStatus,
  clearUnreadCount,
} = messageSlice.actions;
export default messageSlice.reducer;
