import { PayloadAction, createSlice } from '@reduxjs/toolkit';

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

const timerDuration = 25;
const delayBeforeNextStage = 500;

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
    },
    finishProgressBar(state) {
      state.stage = 3;
      state.progress = 100;
    },
    updateProgress(state) {
      const elapsedTime = Date.now() - state.startTime;
      const calculatedProgress = Math.min(100, (elapsedTime / (timerDuration * 1000)) * 100);

      if (calculatedProgress >= 100) {
        state.progress = 100;
        if (state.stage < 3) {
          // Delayed call to move to next stage (animation needed):
          setTimeout(() => {
            state.stage += 1;
            state.progress = 0;
            state.startTime = Date.now();
          }, delayBeforeNextStage);
        }
      } else if (state.progress < 100 && state.stage < 3) {
        state.progress = Math.floor(calculatedProgress);
      }
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
  updateProgress,
} = progressBarSlice.actions;
export default progressBarSlice.reducer;
