import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFullDocument } from '../../common/utils/getFullDocument';
import { PageDocumentState } from './pageDocument.slice';

export const fetchPageDocument = createAsyncThunk('pageDocument/fetchPageDocument', async (_, { rejectWithValue }) => {
  try {
    const response: string = await getFullDocument();
    return response;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const pageDocumentExtraReducers = (builder: ActionReducerMapBuilder<PageDocumentState>) => {
  builder
    .addCase(fetchPageDocument.pending, (state) => {
      state.pageDocument.isLoading = true;
    })
    .addCase(fetchPageDocument.fulfilled, (state, action) => {
      state.pageDocument.content = action.payload;
      state.pageDocument.isLoading = false;
    })
    .addCase(fetchPageDocument.rejected, (state, action) => {
      state.pageDocument.error = action.error.message;
      state.pageDocument.isLoading = false;
    });
};
