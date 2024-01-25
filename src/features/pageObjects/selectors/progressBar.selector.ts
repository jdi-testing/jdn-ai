import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';

const selectProgressBarState = (state: RootState) => state.progressBar;

export const selectIsStarted = createSelector(selectProgressBarState, (state) => state.isStarted);

export const selectProgress = createSelector(selectProgressBarState, (state) => state.progress);

export const selectStage = createSelector(selectProgressBarState, (state) => state.stage);

export const selectIsProgressBarFinished = createSelector(selectProgressBarState, (state) => {
  return state.stage === 3 && state.progress === 100;
});
