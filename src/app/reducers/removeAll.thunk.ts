import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { removeAll as removeAllLocators } from '../../features/locators/locators.slice';
import { removeAll as removeAllPageObjects } from '../../features/pageObjects/pageObject.slice';
import { removeAll as removeAllFilters } from '../../features/filter/filter.slice';
import { clearAll } from '../main.slice';
import { MainState } from '../types/mainSlice.types';

export const removeAll = createAsyncThunk('main/removeAll', async (_, thunkAPI) => {
  const dispatch = thunkAPI.dispatch;
  dispatch(removeAllLocators());
  dispatch(removeAllPageObjects());
  dispatch(removeAllFilters());
  dispatch(clearAll());

  return thunkAPI.fulfillWithValue(true);
});

export const removeAllReducer = (builder: ActionReducerMapBuilder<MainState>) => {
  return builder.addCase(removeAll.rejected, (error) => {
    console.warn('rejected', error);
  });
};
