import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectEmptyPageObjects } from "../../../features/pageObjects/pageObject.selectors";
import { removeFilters } from "../../filter/filter.slice";
import { removePageObjects } from "../../pageObjects/pageObject.slice";

export const removeEmptyPageObjects = createAsyncThunk("pageObject/removeEmptyPageObjects", (payload, thunkAPI) => {
  const state = thunkAPI.getState();
  const emptyPOIds = selectEmptyPageObjects(state);

  thunkAPI.dispatch(removePageObjects(emptyPOIds));
  thunkAPI.dispatch(removeFilters(emptyPOIds));
});
