// store/slices/courseSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Course {
  id: string;
  title: string;
  [key: string]: unknown;
}

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;
}

const courseSlice = createSlice({
  name: "courses",
  initialState: { courses: [], currentCourse: null, isLoading: false, error: null } as CourseState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => { state.courses = action.payload; },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => { state.currentCourse = action.payload; },
    addCourse: (state, action: PayloadAction<Course>) => { state.courses.unshift(action.payload); },
    updateCourse: (state, action: PayloadAction<Course>) => {
      const i = state.courses.findIndex((c) => c.id === action.payload.id);
      if (i !== -1) state.courses[i] = action.payload;
    },
    removeCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter((c) => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; },
  },
});

export const { setCourses, setCurrentCourse, addCourse, updateCourse, removeCourse, setLoading, setError } = courseSlice.actions;
export default courseSlice.reducer;
