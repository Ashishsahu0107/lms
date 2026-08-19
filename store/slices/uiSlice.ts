// store/slices/uiSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  isPageLoading: boolean;
}
const slice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    activeModal: null,
    isPageLoading: false,
  } as UIState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.isPageLoading = action.payload;
    },
  },
});
export const { toggleSidebar, setSidebarOpen, setActiveModal, setPageLoading } =
  slice.actions;
export default slice.reducer;
