import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface ProgressBarState {
  isStarted: boolean;
  progress: number;
  stage: number;
  startTime: number;
}

export const initialState: ProgressBarState = {
  isStarted: false,
  progress: 0,
  stage: 1,
  startTime: 0,
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
    },
    finishProgressBar(state) {
      state.stage = 3;
      state.progress = 100;
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
} = progressBarSlice.actions;

export default progressBarSlice.reducer;
