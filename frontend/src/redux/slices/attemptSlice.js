import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  startAttempt,
  saveAttemptAnswers,
  submitAttempt,
  getQuizAttempts,
  getAttemptDetails,
} from "../../services/attemptService";

export const startNewAttempt = createAsyncThunk(
  "attempts/start",
  async (quizId, { rejectWithValue }) => {
    try {
      const res = await startAttempt(quizId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to start quiz attempt",
      );
    }
  },
);

export const autosaveAttemptAnswers = createAsyncThunk(
  "attempts/autosave",
  async ({ attemptId, answers }, { rejectWithValue }) => {
    try {
      const res = await saveAttemptAnswers(attemptId, answers);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Autosave failed");
    }
  },
);

export const submitQuizAttempt = createAsyncThunk(
  "attempts/submit",
  async ({ attemptId, payload }, { rejectWithValue }) => {
    try {
      const res = await submitAttempt(attemptId, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Submission failed",
      );
    }
  },
);

export const fetchQuizAttempts = createAsyncThunk(
  "attempts/fetchAttempts",
  async (quizId, { rejectWithValue }) => {
    try {
      const res = await getQuizAttempts(quizId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch attempts",
      );
    }
  },
);

export const fetchAttemptDetails = createAsyncThunk(
  "attempts/fetchDetails",
  async (attemptId, { rejectWithValue }) => {
    try {
      const res = await getAttemptDetails(attemptId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch attempt details",
      );
    }
  },
);

const initialState = {
  attempts: [],
  currentAttempt: null,
  attemptQuestions: [],
  attemptMetaData: null,
  loading: false,
  error: null,
  success: false,
};

const attemptSlice = createSlice({
  name: "attempts",
  initialState,
  reducers: {
    clearAttemptState: (state) => {
      state.error = null;
      state.success = false;
    },
    resetCurrentAttempt: (state) => {
      state.currentAttempt = null;
      state.attemptQuestions = [];
      state.attemptMetaData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Attempt
      .addCase(startNewAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startNewAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = {
          _id: action.payload.attemptId,
          quizId: action.payload.quizId,
          answers: [],
        };
        state.attemptQuestions = action.payload.questions;
        state.attemptMetaData = {
          duration: action.payload.duration,
          totalMarks: action.payload.totalMarks,
          passingMarks: action.payload.passingMarks,
          title: action.payload.title,
          instructions: action.payload.instructions,
        };
      })
      .addCase(startNewAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit Attempt
      .addCase(submitQuizAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentAttempt = action.payload;
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Quiz Attempts
      .addCase(fetchQuizAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.attempts = action.payload;
      })
      .addCase(fetchQuizAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Attempt Details
      .addCase(fetchAttemptDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttemptDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload.attempt;
        state.attemptQuestions = action.payload.questions;
      })
      .addCase(fetchAttemptDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttemptState, resetCurrentAttempt } = attemptSlice.actions;
export default attemptSlice.reducer;
