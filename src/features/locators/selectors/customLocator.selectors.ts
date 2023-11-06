import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';

const selectCustomLocatorState = (state: RootState) => state.customLocator;

export const selectIsCreatingFormOpen = createSelector(
  [selectCustomLocatorState],
  (customLocator) => customLocator.isCreatingFormOpen,
);

export const selectIsEditModalOpen = createSelector(
  [selectCustomLocatorState],
  (customLocator) => customLocator.isEditModalOpen,
);
