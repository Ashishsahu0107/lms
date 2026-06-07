import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../services/assignmentService";

export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getAssignments(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch assignments");
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  "assignments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getAssignmentById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch assignment details");
    }
  }
);

export const addAssignment = createAsyncThunk(
  "assignments/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createAssignment(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to publish assignment");
    }
  }
);

export const editAssignment = createAsyncThunk(
  "assignments/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateAssignment(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update assignment");
    }
  }
);

export const removeAssignment = createAsyncThunk(
  "assignments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAssignment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete assignment");
    }
  }
);

const initialState = {
  assignments: [],
  currentAssignment: null,
  currentSubmission: null, // associated submission for active student
  loading: false,
  error: null,
  success: false,
};

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    clearAssignmentState: (state) => {
      state.error = null;
      state.success = false;
    },
    resetCurrentAssignment: (state) => {
      state.currentAssignment = null;
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Assignment By ID
      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload.assignment;
        state.currentSubmission = action.payload.submission;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Assignment
      .addCase(addAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.assignments.unshift(action.payload);
      })
      .addCase(addAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Assignment
      .addCase(editAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(editAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.assignments = state.assignments.map((a) =>
          a._id === action.payload._id ? action.payload : a
        );
        if (state.currentAssignment?._id === action.payload._id) {
          state.currentAssignment = action.payload;
        }
      })
      .addCase(editAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Assignment
      .addCase(removeAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter((a) => a._id !== action.payload);
      });
  },
});

export const { clearAssignmentState, resetCurrentAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;
