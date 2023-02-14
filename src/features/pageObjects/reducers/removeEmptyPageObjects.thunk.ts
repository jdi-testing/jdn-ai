import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectEmptyPageObjects } from "../pageObject.selectors";
import { removeFilters } from "../../filter/filter.slice";
import { removePageObjects } from "../pageObject.slice";
import { RootState } from "../../../app/store/store";

export const removeEmptyPageObjects = createAsyncThunk("pageObject/removeEmptyPageObjects", (payload, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const emptyPOIds = selectEmptyPageObjects(state);

  thunkAPI.dispatch(removePageObjects(emptyPOIds));
  thunkAPI.dispatch(removeFilters({ pageObjectIds: emptyPOIds }));
});
