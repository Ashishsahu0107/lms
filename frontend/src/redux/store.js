import { configureStore } from "@reduxjs/toolkit";
import courseReducer from "./slices/courseSlice";
import quizReducer from "./slices/quizSlice";
import attemptReducer from "./slices/attemptSlice";
import assignmentReducer from "./slices/assignmentSlice";
import submissionReducer from "./slices/submissionSlice";
import attendanceReducer from "./slices/attendanceSlice";
import progressReducer from "./slices/progressSlice";
import playerReducer from "./slices/playerSlice";
import notesReducer from "./slices/notesSlice";
import messageReducer from "./slices/messageSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    courses: courseReducer,
    quizzes: quizReducer,
    attempts: attemptReducer,
    assignments: assignmentReducer,
    submissions: submissionReducer,
    attendance: attendanceReducer,
    progress: progressReducer,
    player: playerReducer,
    notes: notesReducer,
    messages: messageReducer,
    notifications: notificationReducer,
  },
});

