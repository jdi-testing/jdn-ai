import { createAsyncThunk } from "@reduxjs/toolkit";
import { removeFilters } from "../../features/filter/filterSlice";
import { selectEmptyPageObjects } from "../../features/pageObjects/pageObjectSelectors";
import { removePageObjects } from "../../features/pageObjects/pageObjectSlice";


export const removeEmptyPageObjects = createAsyncThunk("pageObject/removeEmptyPageObjects", (payload, thunkAPI) => {
  const state = thunkAPI.getState();
  const emptyPOIds = selectEmptyPageObjects(state);

  thunkAPI.dispatch(removePageObjects(emptyPOIds));
  thunkAPI.dispatch(removeFilters(emptyPOIds));
});
