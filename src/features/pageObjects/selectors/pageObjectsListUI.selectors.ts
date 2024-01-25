import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { PageObjectsListUIState } from '../pageObjectsListUI.slice';

export const selectPageObjectsListUIState = (state: RootState) => state.pageObjectsListUI;

export const selectIsPageObjectsListUIEnabled = createSelector(
  [selectPageObjectsListUIState],
  (pageObjectsListUI: PageObjectsListUIState) => pageObjectsListUI.isPageObjectsListUIEnabled,
);
