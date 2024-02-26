import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store/store';

const selectPageDocumentState = (state: RootState) => state.pageDocument;

export const selectPageDocument = createSelector(selectPageDocumentState, (state) => state.pageDocument.content);
export const selectPageDocumentForRobula = createSelector(
  selectPageDocumentState,
  (state) => state.pageDocumentForRobula,
);
