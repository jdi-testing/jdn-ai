import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectEmptyPageObjects } from "../selectors/pageObjectSelectors";
import { removePageObjects } from "../slices/pageObjectSlice";


export const removeEmptyPageObjects = createAsyncThunk("pageObject/removeEmptyPageObjects", (payload, thunkAPI) => {
  const state = thunkAPI.getState();
  const emptyPOs = selectEmptyPageObjects(state);

  thunkAPI.dispatch(removePageObjects(emptyPOs));
});
