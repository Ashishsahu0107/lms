import { configureStore } from "@reduxjs/toolkit";
import courseReducer from "./slices/courseSlice";
import quizReducer from "./slices/quizSlice";
import attemptReducer from "./slices/attemptSlice";
import assignmentReducer from "./slices/assignmentSlice";
import submissionReducer from "./slices/submissionSlice";
import attendanceReducer from "./slices/attendanceSlice";

export const store = configureStore({
  reducer: {
    courses: courseReducer,
    quizzes: quizReducer,
    attempts: attemptReducer,
    assignments: assignmentReducer,
    submissions: submissionReducer,
    attendance: attendanceReducer,
  },
});

