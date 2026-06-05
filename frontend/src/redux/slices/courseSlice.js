import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";
import { createModule, updateModule, deleteModule } from "../../services/moduleService";
import { createTopic, updateTopic, deleteTopic } from "../../services/topicService";

// ─── Thunks: Courses ──────────────────────────────────────────────────────────

export const fetchCourses = createAsyncThunk(
  "courses/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getCourses(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch courses");
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  "courses/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getCourseById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch course");
    }
  }
);

export const addCourse = createAsyncThunk(
  "courses/create",
  async (data, { rejectWithValue }) => {
    try {
      // data may contain thumbnailFile: File — service builds FormData internally
      const res = await createCourse(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create course");
    }
  }
);

export const editCourse = createAsyncThunk(
  "courses/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // data may contain thumbnailFile: File — service builds FormData internally
      const res = await updateCourse(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update course");
    }
  }
);

export const removeCourse = createAsyncThunk(
  "courses/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCourse(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete course");
    }
  }
);

// ─── Thunks: Modules ──────────────────────────────────────────────────────────

export const addModule = createAsyncThunk(
  "courses/addModule",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await createModule(data);
      await dispatch(fetchCourseById(data.courseId));
      return data.courseId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create module");
    }
  }
);

export const editModule = createAsyncThunk(
  "courses/editModule",
  async ({ id, data, courseId }, { dispatch, rejectWithValue }) => {
    try {
      await updateModule(id, data);
      await dispatch(fetchCourseById(courseId));
      return courseId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update module");
    }
  }
);

export const removeModule = createAsyncThunk(
  "courses/removeModule",
  async ({ moduleId, courseId }, { dispatch, rejectWithValue }) => {
    try {
      await deleteModule(moduleId);
      await dispatch(fetchCourseById(courseId));
      return courseId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete module");
    }
  }
);

// ─── Thunks: Topics ───────────────────────────────────────────────────────────

export const addTopic = createAsyncThunk(
  "courses/addTopic",
  async ({ data, courseId }, { dispatch, rejectWithValue }) => {
    try {
      await createTopic(data);
      await dispatch(fetchCourseById(courseId));
      return courseId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create topic");
    }
  }
);

export const editTopic = createAsyncThunk(
  "courses/editTopic",
  async ({ id, data, courseId }, { dispatch, rejectWithValue }) => {
    try {
      await updateTopic(id, data);
      await dispatch(fetchCourseById(courseId));
      return courseId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update topic");
    }
  }
);

export const removeTopic = createAsyncThunk(
  "courses/removeTopic",
  async ({ topicId, courseId }, { dispatch, rejectWithValue }) => {
    try {
      await deleteTopic(topicId);
      await dispatch(fetchCourseById(courseId));
      return courseId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete topic");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const mutatingThunks = [addModule, editModule, removeModule, addTopic, editTopic, removeTopic];

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    list: [],
    activeCourse: null,
    loading: false,
    submitting: false,
    error: null,
    // uploadProgress: 0-100, used for thumbnail upload progress bar
    uploadProgress: 0,
  },
  reducers: {
    clearActiveCourse(state) {
      state.activeCourse = null;
    },
    clearError(state) {
      state.error = null;
    },
    setActiveCourse(state, action) {
      state.activeCourse = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── fetchCourses
    builder
      .addCase(fetchCourses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCourses.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // ── fetchCourseById
    builder
      .addCase(fetchCourseById.pending, (state) => { state.loading = true; })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeCourse = action.payload;
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // ── addCourse
    builder
      .addCase(addCourse.pending, (state) => { state.submitting = true; })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.submitting = false;
        state.list.unshift(action.payload);
      })
      .addCase(addCourse.rejected, (state, action) => { state.submitting = false; state.error = action.payload; });

    // ── editCourse
    builder
      .addCase(editCourse.pending, (state) => { state.submitting = true; })
      .addCase(editCourse.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.activeCourse?._id === action.payload._id) state.activeCourse = action.payload;
      })
      .addCase(editCourse.rejected, (state, action) => { state.submitting = false; state.error = action.payload; });

    // ── removeCourse
    builder
      .addCase(removeCourse.pending, (state) => { state.submitting = true; })
      .addCase(removeCourse.fulfilled, (state, action) => {
        state.submitting = false;
        state.list = state.list.filter((c) => c._id !== action.payload);
        if (state.activeCourse?._id === action.payload) state.activeCourse = null;
      })
      .addCase(removeCourse.rejected, (state, action) => { state.submitting = false; state.error = action.payload; });

    // ── Module & Topic mutating thunks (shared pending/rejected/fulfilled)
    mutatingThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.submitting = true; })
        .addCase(thunk.fulfilled, (state) => { state.submitting = false; })
        .addCase(thunk.rejected, (state, action) => { state.submitting = false; state.error = action.payload; });
    });
  },
});

export const { clearActiveCourse, clearError, setActiveCourse } = courseSlice.actions;
export default courseSlice.reducer;
