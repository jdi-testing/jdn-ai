import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface ProgressBarState {
  isStarted: boolean;
  progress: number;
  stage: number;
  startTime: number;
  error: string;
}

export const initialState: ProgressBarState = {
  isStarted: false,
  progress: 0,
  stage: 1,
  startTime: 0,
  error: '',
};

const progressBarSlice = createSlice({
  name: 'progressBar',
  initialState,
  reducers: {
    startProgressBar(state) {
      state.isStarted = true;
    },
    stopProgressBar(state) {
      state.isStarted = false;
    },
    setProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    increaseStage(state) {
      state.stage += 1;
    },
    resetProgressBar(state) {
      state.isStarted = false;
      state.progress = 0;
      state.stage = 1;
      state.startTime = 0;
      state.error = '';
    },
    finishProgressBar(state) {
      state.stage = 3;
      state.progress = 100;
    },
    setProgressError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setStartTime(state, action: PayloadAction<number>) {
      state.startTime = action.payload;
    },
  },
});

export const {
  startProgressBar,
  stopProgressBar,
  setProgress,
  resetProgressBar,
  increaseStage,
  finishProgressBar,
  setStartTime,
  setProgressError,
} = progressBarSlice.actions;

export default progressBarSlice.reducer;
