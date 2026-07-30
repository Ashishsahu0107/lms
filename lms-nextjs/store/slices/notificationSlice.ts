// store/slices/notificationSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface Notification {
  id: string;
  title: string;
  read: boolean;
  [key: string]: unknown;
}
interface NotifState {
  notifications: Notification[];
  unreadCount: number;
}
const slice = createSlice({
  name: "notifications",
  initialState: { notifications: [], unreadCount: 0 } as NotifState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) state.unreadCount++;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find((n) => n.id === action.payload);
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
  },
});
export const { setNotifications, addNotification, markRead, markAllRead } =
  slice.actions;
export default slice.reducer;
