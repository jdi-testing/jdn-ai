import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ViewMode {
  Table = 'table',
  List = 'list',
}

interface ViewState {
  mode: ViewMode;
}

const initialState: ViewState = {
  mode: ViewMode.Table,
};

const vividusViewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.mode = action.payload;
    },
    toggleViewMode(state) {
      state.mode = state.mode === ViewMode.Table ? ViewMode.List : ViewMode.Table;
    },
  },
});

export const { setViewMode, toggleViewMode } = vividusViewSlice.actions;
export default vividusViewSlice.reducer;
