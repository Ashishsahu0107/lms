import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  cloneQuiz as cloneQuizApi,
  bulkImportQuestions as bulkImportQuestionsApi,
  getQuestionBank as getQuestionBankApi,
} from "../../services/quizService";

// ─── Thunks: Quizzes ──────────────────────────────────────────────────────────

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getQuizzes(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch quizzes");
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  "quizzes/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getQuizById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch quiz");
    }
  }
);

export const addQuiz = createAsyncThunk(
  "quizzes/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createQuiz(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create quiz");
    }
  }
);

export const editQuiz = createAsyncThunk(
  "quizzes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateQuiz(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quiz");
    }
  }
);

export const removeQuiz = createAsyncThunk(
  "quizzes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteQuiz(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete quiz");
    }
  }
);

export const cloneQuiz = createAsyncThunk(
  "quizzes/clone",
  async (id, { rejectWithValue }) => {
    try {
      const res = await cloneQuizApi(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clone quiz");
    }
  }
);

export const bulkImportQuestions = createAsyncThunk(
  "quizzes/bulkImport",
  async ({ id, questions }, { rejectWithValue }) => {
    try {
      const res = await bulkImportQuestionsApi(id, questions);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to import questions");
    }
  }
);

export const fetchQuestionBank = createAsyncThunk(
  "quizzes/fetchQuestionBank",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getQuestionBankApi();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch question bank");
    }
  }
);

const initialState = {
  quizzes: [],
  currentQuiz: null,
  currentQuestions: [],
  questionBank: [],
  loading: false,
  error: null,
  success: false,
};

const quizSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    clearQuizState: (state) => {
      state.error = null;
      state.success = false;
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Quiz By ID
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload.quiz;
        state.currentQuestions = action.payload.questions;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Quiz
      .addCase(addQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.quizzes.unshift(action.payload);
      })
      .addCase(addQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Quiz
      .addCase(editQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(editQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.quizzes = state.quizzes.map((q) =>
          q._id === action.payload._id ? action.payload : q
        );
        if (state.currentQuiz?._id === action.payload._id) {
          state.currentQuiz = action.payload;
        }
      })
      .addCase(editQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Quiz
      .addCase(removeQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((q) => q._id !== action.payload);
      })

      // Clone Quiz
      .addCase(cloneQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cloneQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.unshift(action.payload);
      })
      .addCase(cloneQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Import Questions
      .addCase(bulkImportQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkImportQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (state.currentQuiz?._id === action.payload._id) {
          state.currentQuiz = action.payload;
        }
      })
      .addCase(bulkImportQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Question Bank
      .addCase(fetchQuestionBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionBank.fulfilled, (state, action) => {
        state.loading = false;
        state.questionBank = action.payload;
      })
      .addCase(fetchQuestionBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearQuizState, setCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;
