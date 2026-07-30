// store/slices/messageSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  content: string;
  [key: string]: unknown;
}
interface MessageState {
  messages: Message[];
  conversations: Message[];
  unreadCount: number;
}
const slice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    conversations: [],
    unreadCount: 0,
  } as MessageState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setConversations: (state, action: PayloadAction<Message[]>) => {
      state.conversations = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});
export const { setMessages, addMessage, setConversations, setUnreadCount } =
  slice.actions;
export default slice.reducer;
