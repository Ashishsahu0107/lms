import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitAssignment,
  getAssignmentSubmissions,
  getSubmissionById,
  gradeSubmission,
} from "../../services/submissionService";

export const fetchAssignmentSubmissions = createAsyncThunk(
  "submissions/fetchForAssignment",
  async (assignmentId, { rejectWithValue }) => {
    try {
      const res = await getAssignmentSubmissions(assignmentId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch student submissions");
    }
  }
);

export const fetchSubmissionDetails = createAsyncThunk(
  "submissions/fetchDetails",
  async (submissionId, { rejectWithValue }) => {
    try {
      const res = await getSubmissionById(submissionId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch submission details");
    }
  }
);

export const submitAssignmentBrief = createAsyncThunk(
  "submissions/submitBrief",
  async (data, { rejectWithValue }) => {
    try {
      const res = await submitAssignment(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit assignment answers");
    }
  }
);

export const evaluateSubmission = createAsyncThunk(
  "submissions/evaluate",
  async ({ submissionId, data }, { rejectWithValue }) => {
    try {
      const res = await gradeSubmission(submissionId, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit grading review");
    }
  }
);

const initialState = {
  submissions: [],
  currentSubmission: null,
  loading: false,
  error: null,
  success: false,
};

const submissionSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    clearSubmissionState: (state) => {
      state.error = null;
      state.success = false;
    },
    resetCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assignment Submissions
      .addCase(fetchAssignmentSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchAssignmentSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Submission Details
      .addCase(fetchSubmissionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubmission = action.payload;
      })
      .addCase(fetchSubmissionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit Assignment Brief
      .addCase(submitAssignmentBrief.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitAssignmentBrief.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentSubmission = action.payload;
      })
      .addCase(submitAssignmentBrief.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evaluate Submission
      .addCase(evaluateSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(evaluateSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentSubmission = action.payload;
        state.submissions = state.submissions.map((s) =>
          s._id === action.payload._id ? action.payload : s
        );
      })
      .addCase(evaluateSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubmissionState, resetCurrentSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
