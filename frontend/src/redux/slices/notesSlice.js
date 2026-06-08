import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../../services/apiClient";
import { localNotesAdded } from "./playerSlice";

export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await apiGet(`/student/notes/${courseId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load notes");
    }
  }
);

export const saveNote = createAsyncThunk(
  "notes/saveNote",
  async ({ courseId, topicId, content, videoPosition }, { dispatch, rejectWithValue }) => {
    try {
      const res = await apiPost("/student/notes", { courseId, topicId, content, videoPosition });
      // Sync into the active player slice state as well
      dispatch(localNotesAdded(res.data.data));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to save note");
    }
  }
);

const initialState = {
  notesList: [],
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notesList = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveNote.fulfilled, (state, action) => {
        state.notesList.unshift(action.payload);
      });
  },
});

export default notesSlice.reducer;
