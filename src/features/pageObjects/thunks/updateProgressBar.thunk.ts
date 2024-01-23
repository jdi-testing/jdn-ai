import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { increaseStage, setProgress, setStartTime } from '../progressBar.slice';

const timerDuration = 25;
const delayBeforeNextStage = 500;

export const updateProgress = createAsyncThunk('progressBar/updateProgress', async (_, { dispatch, getState }) => {
  const state = (getState() as RootState).progressBar;
  const elapsedTime = Date.now() - state.startTime;
  const calculatedProgress = Math.min(100, (elapsedTime / (timerDuration * 1000)) * 100);

  if (calculatedProgress >= 100) {
    dispatch(setProgress(100));
    if (state.stage < 3) {
      // Delayed call to move to next stage (animation needed):
      setTimeout(() => {
        dispatch(increaseStage());
        dispatch(setProgress(0));
        dispatch(setStartTime(Date.now()));
      }, delayBeforeNextStage);
    }
  } else if (state.progress < 100 && state.stage < 3) {
    dispatch(setProgress(Math.floor(calculatedProgress)));
  }
});
