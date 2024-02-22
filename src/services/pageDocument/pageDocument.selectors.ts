import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store/store';

const selectPageDocumentState = (state: RootState) => state.pageDocument;

export const selectPageDocument = createSelector(selectPageDocumentState, (state) => state.pageDocument.content);
