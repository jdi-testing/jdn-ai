import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { BackendStatus, MainState } from '../types/mainSlice.types';
import { defineServer } from './defineServer.thunk';

export const redefineServer = createAsyncThunk('main/redefineServer', async (_, thunkApi) => {
  thunkApi.dispatch(defineServer());
});

export const redefineServerReducer = (builder: ActionReducerMapBuilder<MainState>) => {
  return builder.addCase(redefineServer.pending, (state) => {
    state.backendAvailable = BackendStatus.Retry;
  });
};
