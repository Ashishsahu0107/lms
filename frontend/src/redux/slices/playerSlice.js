import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../../services/apiClient";

export const fetchCoursePlayerDetails = createAsyncThunk(
  "player/fetchDetails",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await apiGet(`/student/course-player/${courseId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load course player",
      );
    }
  },
);

export const updateTopicWatchProgress = createAsyncThunk(
  "player/updateProgress",
  async (
    { courseId, topicId, watchPosition, duration, watchTimeDelta },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiPost("/student/progress/update", {
        courseId,
        topicId,
        watchPosition,
        duration,
        watchTimeDelta,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to sync progress",
      );
    }
  },
);

export const fetchCourseDiscussions = createAsyncThunk(
  "player/fetchDiscussions",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await apiGet(`/student/course/${courseId}/discussions`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load discussions",
      );
    }
  },
);

export const addDiscussionComment = createAsyncThunk(
  "player/addComment",
  async ({ courseId, content }, { rejectWithValue }) => {
    try {
      const res = await apiPost(`/student/course/${courseId}/discussions`, {
        content,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to post comment",
      );
    }
  },
);

export const addBookmark = createAsyncThunk(
  "player/addBookmark",
  async ({ courseId, topicId, title, videoPosition }, { rejectWithValue }) => {
    try {
      const res = await apiPost("/student/bookmarks", {
        courseId,
        topicId,
        title,
        videoPosition,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add bookmark",
      );
    }
  },
);

export const fetchBookmarks = createAsyncThunk(
  "player/fetchBookmarks",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await apiGet(`/student/bookmarks/${courseId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load bookmarks",
      );
    }
  },
);

const initialState = {
  course: null,
  progress: null,
  notes: [],
  bookmarks: [],
  discussions: [],
  currentTopic: null,
  watchPosition: 0,
  loading: false,
  error: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setCurrentTopic: (state, action) => {
      state.currentTopic = action.payload;
      // Resolve watch position for the selected topic
      if (state.progress && state.progress.lectureProgress) {
        const entry = state.progress.lectureProgress.find(
          (l) => l.lectureId.toString() === action.payload._id.toString(),
        );
        state.watchPosition = entry ? entry.watchPosition : 0;
      } else {
        state.watchPosition = 0;
      }
    },
    receiveDiscussionComment: (state, action) => {
      state.discussions.push(action.payload);
    },
    localProgressUpdate: (state, action) => {
      const { topicId, watchPosition, completed } = action.payload;
      if (state.progress && state.progress.lectureProgress) {
        const entry = state.progress.lectureProgress.find(
          (l) => l.lectureId.toString() === topicId.toString(),
        );
        if (entry) {
          entry.watchPosition = watchPosition;
          entry.completed = completed;
        } else {
          state.progress.lectureProgress.push({
            lectureId: topicId,
            watchPosition,
            completed,
          });
        }
      }
    },
    localNotesAdded: (state, action) => {
      state.notes.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch details
      .addCase(fetchCoursePlayerDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursePlayerDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.course = action.payload.course;
        state.progress = action.payload.progress;
        state.notes = action.payload.notes;
        state.bookmarks = action.payload.bookmarks;
        state.discussions = action.payload.discussions;

        // Auto-select topic: resume from lastAccessedTopicId or pick the first topic
        if (state.course && state.course.modules) {
          const allTopics = state.course.modules.flatMap((m) => m.topics || []);
          if (allTopics.length > 0) {
            const lastAccessedId = state.progress?.lastAccessedTopicId;
            const resumeTopic = lastAccessedId
              ? allTopics.find(
                  (t) => t._id.toString() === lastAccessedId.toString(),
                )
              : null;
            state.currentTopic = resumeTopic || allTopics[0];

            // Set position
            const entry = state.progress?.lectureProgress?.find(
              (l) =>
                l.lectureId.toString() === state.currentTopic._id.toString(),
            );
            state.watchPosition = entry ? entry.watchPosition : 0;
          }
        }
      })
      .addCase(fetchCoursePlayerDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Sync progress
      .addCase(updateTopicWatchProgress.fulfilled, (state, action) => {
        const { progress, watchPosition, completed } = action.payload;
        if (state.progress) {
          state.progress.progress = progress;
          const entry = state.progress.lectureProgress.find(
            (l) =>
              l.lectureId.toString() === state.currentTopic?._id.toString(),
          );
          if (entry) {
            entry.watchPosition = watchPosition;
            entry.completed = completed;
          }
        }
      })

      // Fetch discussions
      .addCase(fetchCourseDiscussions.fulfilled, (state, action) => {
        state.discussions = action.payload;
      })

      // Add comment
      .addCase(addDiscussionComment.fulfilled, (state, action) => {
        // Handled via socket event as well to prevent double entries,
        // but if sockets are slow, keeping it here is fine.
        const exists = state.discussions.some(
          (d) => d._id === action.payload._id,
        );
        if (!exists) {
          state.discussions.push(action.payload);
        }
      })

      // Add bookmark
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.bookmarks.push(action.payload);
        state.bookmarks.sort((a, b) => a.videoPosition - b.videoPosition);
      })

      // Fetch bookmarks
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.bookmarks = action.payload;
      });
  },
});

export const {
  setCurrentTopic,
  receiveDiscussionComment,
  localProgressUpdate,
  localNotesAdded,
} = playerSlice.actions;

export default playerSlice.reducer;
