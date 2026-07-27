import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPatch, apiDelete } from "../../services/apiClient";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGet("/notifications");
      if (res.data?.success) {
        return res.data.data;
      }
      return rejectWithValue(
        res.data?.message || "Failed to fetch notifications",
      );
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiPatch(`/notifications/${id}/read`);
      if (res.data?.success) {
        return id;
      }
      return rejectWithValue(res.data?.message || "Failed to mark read");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark read",
      );
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiPatch("/notifications/read-all");
      if (res.data?.success) {
        return true;
      }
      return rejectWithValue(res.data?.message || "Failed to mark all read");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark all read",
      );
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiDelete(`/notifications/${id}`);
      if (res.data?.success) {
        return id;
      }
      return rejectWithValue(
        res.data?.message || "Failed to delete notification",
      );
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      const exists = state.notifications.some(
        (n) => n._id === action.payload._id,
      );
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      // Mark Read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.notifications = state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n,
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      // Mark All Read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        state.unreadCount = 0;
      })
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const target = state.notifications.find((n) => n._id === id);
        state.notifications = state.notifications.filter((n) => n._id !== id);
        if (target && !target.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
