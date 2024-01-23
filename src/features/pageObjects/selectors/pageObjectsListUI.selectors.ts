import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { PageObjectState } from '../types/pageObjectSlice.types';

export const selectPageObjectsState = (state: RootState) => state.pageObject.present;

export const selectIsPageObjectsListUIEnabled = createSelector(
  [selectPageObjectsState],
  (pageObjectsState: PageObjectState) => pageObjectsState.isPageObjectsListUIEnabled,
);
