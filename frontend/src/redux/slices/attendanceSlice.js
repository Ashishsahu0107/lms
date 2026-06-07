import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as attendanceService from "../../services/attendanceService";

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const createSession = createAsyncThunk(
  "attendance/createSession",
  async (data, { rejectWithValue }) => {
    try {
      const res = await attendanceService.createAttendanceSession(data);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create session");
    }
  }
);

export const fetchCourseSessions = createAsyncThunk(
  "attendance/fetchCourseSessions",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getCourseAttendanceSessions(courseId);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch sessions");
    }
  }
);

export const deleteSession = createAsyncThunk(
  "attendance/deleteSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await attendanceService.deleteAttendanceSession(sessionId);
      return sessionId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete session");
    }
  }
);

export const fetchSessionStudents = createAsyncThunk(
  "attendance/fetchSessionStudents",
  async ({ courseId, date, sessionId }, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getCourseAttendanceStudents(courseId, date, sessionId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load students");
    }
  }
);

export const markAttendance = createAsyncThunk(
  "attendance/markAttendance",
  async (data, { rejectWithValue }) => {
    try {
      const res = await attendanceService.markDailyAttendance(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to save attendance");
    }
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  "attendance/fetchAttendanceStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getAttendanceStats();
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load stats");
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  "attendance/fetchMyAttendance",
  async (params, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getMyAttendance(params);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load attendance logs");
    }
  }
);

export const fetchMyAttendanceCalendar = createAsyncThunk(
  "attendance/fetchMyAttendanceCalendar",
  async (params, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getMyAttendanceCalendar(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load calendar");
    }
  }
);

export const fetchMyAttendancePercentage = createAsyncThunk(
  "attendance/fetchMyAttendancePercentage",
  async (_, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getMyAttendancePercentage();
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load percentages");
    }
  }
);

export const fetchAdminAttendanceAnalytics = createAsyncThunk(
  "attendance/fetchAdminAttendanceAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getAdminAttendanceAnalytics();
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load admin analytics");
    }
  }
);

// ── Slice Definition ─────────────────────────────────────────────────────────

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    sessions: [],
    students: [],
    loading: false,
    sessionsLoading: false,
    studentsLoading: false,
    saving: false,
    stats: null,
    myRecords: [],
    myCalendar: {},
    myPercentages: [],
    myCalendarCourses: [],
    adminAnalytics: null,
    error: null,
  },
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions.unshift(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Sessions
      .addCase(fetchCourseSessions.pending, (state) => {
        state.sessionsLoading = true;
      })
      .addCase(fetchCourseSessions.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchCourseSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.error = action.payload;
      })

      // Delete Session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s._id !== action.payload);
      })

      // Fetch Students
      .addCase(fetchSessionStudents.pending, (state) => {
        state.studentsLoading = true;
      })
      .addCase(fetchSessionStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.students = action.payload.data || [];
      })
      .addCase(fetchSessionStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.error = action.payload;
      })

      // Mark Attendance
      .addCase(markAttendance.pending, (state) => {
        state.saving = true;
      })
      .addCase(markAttendance.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // Stats
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Student Attendance Records
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myRecords = action.payload;
      })

      // Student Calendar
      .addCase(fetchMyAttendanceCalendar.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAttendanceCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.myCalendar = action.payload.data || {};
        state.myCalendarCourses = action.payload.courses || [];
      })

      // Student Percentages
      .addCase(fetchMyAttendancePercentage.fulfilled, (state, action) => {
        state.myPercentages = action.payload;
      })

      // Admin Analytics
      .addCase(fetchAdminAttendanceAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminAttendanceAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.adminAnalytics = action.payload;
      });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
