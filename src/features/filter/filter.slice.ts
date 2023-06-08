import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PageObjectId } from "../pageObjects/types/pageObjectSlice.types";
import { filterAdapter } from "./filter.selectors";
import { toggleClassFilterReducer } from "./reducers/toggleClassFilter.thunk";
import { toggleClassFilterAllReducer } from "./reducers/toggleClassFilterAll.thunk";

const filterSlice = createSlice({
  name: "filter",
  initialState: filterAdapter.getInitialState({}),
  reducers: {
    removeAll(state) {
      filterAdapter.removeAll(state);
    },
    removeFilters(state, { payload }: PayloadAction<{ pageObjectIds: PageObjectId[] }>) {
      const { pageObjectIds } = payload;
      filterAdapter.removeMany(state, pageObjectIds);
    },
  },
  extraReducers: (builder) => {
    toggleClassFilterReducer(builder), toggleClassFilterAllReducer(builder);
  },
});

export default filterSlice.reducer;
export const { removeAll, removeFilters } = filterSlice.actions;
