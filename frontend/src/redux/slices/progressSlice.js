import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProgressDetails,
  getStudentAnalyticsInsights,
} from "../../services/studentService";
import { getPerformanceAnalytics } from "../../services/adminAnalyticsService";

export const fetchProgressDetails = createAsyncThunk(
  "progress/fetchDetails",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await getProgressDetails(courseId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to fetch course progress details",
      );
    }
  },
);

export const fetchStudentInsights = createAsyncThunk(
  "progress/fetchInsights",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getStudentAnalyticsInsights();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to fetch student learning insights",
      );
    }
  },
);

export const fetchLeaderboard = createAsyncThunk(
  "progress/fetchLeaderboard",
  async (courseId = "", { rejectWithValue }) => {
    try {
      const res = await getPerformanceAnalytics({ courseId });
      return res.data.leaderboard || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch leaderboard rankings",
      );
    }
  },
);

const initialState = {
  progressDetails: null,
  insights: null,
  leaderboard: [],
  loading: false,
  error: null,
  success: false,
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    clearProgressState: (state) => {
      state.error = null;
      state.success = false;
    },
    resetProgressDetails: (state) => {
      state.progressDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Progress Details
      .addCase(fetchProgressDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgressDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.progressDetails = action.payload;
      })
      .addCase(fetchProgressDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Student Insights
      .addCase(fetchStudentInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(fetchStudentInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProgressState, resetProgressDetails } =
  progressSlice.actions;
export default progressSlice.reducer;
