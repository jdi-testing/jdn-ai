import { createSlice } from '@reduxjs/toolkit';
import { pageDocumentReducers } from './pageDocument.reducers';
import { pageDocumentExtraReducers } from './fetchPageDocument.thunk';

export interface PageDocumentState {
  pageDocument: {
    content: null | string;
    isLoading: boolean;
    error?: string;
  };
  pageDocumentForRobula: null | string;
  notShownElementIds: string[];
}

export const initialState: PageDocumentState = {
  pageDocument: { content: null, isLoading: false },
  pageDocumentForRobula: null,
  notShownElementIds: [],
};

const pageDocumentSlice = createSlice({
  name: 'pageDocument',
  initialState,
  reducers: pageDocumentReducers,
  extraReducers: pageDocumentExtraReducers,
});

export const { createDocumentForRobula, setNotShownElementsIds } = pageDocumentSlice.actions;

export default pageDocumentSlice.reducer;
