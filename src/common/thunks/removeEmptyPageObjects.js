import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectEmptyPageObjects } from "../../features/pageObjects/pageObjectSelectors";
import { removePageObjects } from "../../features/pageObjects/pageObjectSlice";


export const removeEmptyPageObjects = createAsyncThunk("pageObject/removeEmptyPageObjects", (payload, thunkAPI) => {
  const state = thunkAPI.getState();
  const emptyPOs = selectEmptyPageObjects(state);

  thunkAPI.dispatch(removePageObjects(emptyPOs));
});
