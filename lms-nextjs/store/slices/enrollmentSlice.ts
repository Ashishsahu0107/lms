// store/slices/enrollmentSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Enrollment { id: string; courseId: string; studentId: string; [key: string]: unknown; }
interface EnrollmentState { enrollments: Enrollment[]; isLoading: boolean; }

const slice = createSlice({
  name: "enrollments",
  initialState: { enrollments: [], isLoading: false } as EnrollmentState,
  reducers: {
    setEnrollments: (state, action: PayloadAction<Enrollment[]>) => { state.enrollments = action.payload; },
    addEnrollment: (state, action: PayloadAction<Enrollment>) => { state.enrollments.unshift(action.payload); },
    removeEnrollment: (state, action: PayloadAction<string>) => { state.enrollments = state.enrollments.filter((e) => e.id !== action.payload); },
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
  },
});

export const { setEnrollments, addEnrollment, removeEnrollment, setLoading } = slice.actions;
export default slice.reducer;
