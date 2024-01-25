import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { finishProgressBar, increaseStage, setProgress, setStartTime } from '../progressBar.slice';
import { delay } from '../../locators/utils/delay';

// it's a Thunk with setTimeout, so it's async
// eslint-disable-next-line @typescript-eslint/require-await
export const updateProgress = createAsyncThunk('progressBar/updateProgress', async (_, { dispatch, getState }) => {
  const updateProgressDelay = 400; // Update 400ms
  const timerDuration = 20; // Duration of each stage in seconds
  const delayBeforeNextStage = 500; // for animation
  const totalStages = 3;

  // Set the start time:
  dispatch(setStartTime(Date.now()));

  while (true) {
    const state = (getState() as RootState).progressBar;
    if (state.stage === totalStages && state.progress === 100) {
      break;
    }

    const elapsedTime = Date.now() - state.startTime;
    const calculatedProgress = Math.min(100, (elapsedTime / (timerDuration * 1000)) * 100);

    if (calculatedProgress >= 100 && state.stage < totalStages) {
      // Ensure progress is set to 100% at the end of each stage

      dispatch(setProgress(100));
      await delay(delayBeforeNextStage); // Wait for animation

      // Reached 100% in the current stage, but not in the last one
      dispatch(increaseStage());
      dispatch(setProgress(0));
      dispatch(setStartTime(Date.now()));
    } else if (state.stage === totalStages && calculatedProgress >= 100) {
      if (state.progress !== 100) {
        // Ensure progress is set to 100% at the end of the last stage
        dispatch(setProgress(100));
        // If reached the last stage and 100% progress
        dispatch(finishProgressBar());
      }
      break;
    } else {
      // Update progress if it has not yet reached 100%
      dispatch(setProgress(Math.floor(calculatedProgress)));
    }

    await delay(updateProgressDelay);
  }
});