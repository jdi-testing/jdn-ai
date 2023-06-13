import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PageObjectId } from "../pageObjects/types/pageObjectSlice.types";
import { Filter, FilterKey } from "./types/filter.types";
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
    setFilter(state, { payload }: PayloadAction<Filter>) {
      const { pageObjectId, JDIclassFilter } = payload;
      filterAdapter.upsertOne(state, {
        pageObjectId,
        [FilterKey.JDIclassFilter]: { ...JDIclassFilter },
      });
    },
  },
  extraReducers: (builder) => {
    toggleClassFilterReducer(builder), toggleClassFilterAllReducer(builder);
  },
});

export default filterSlice.reducer;
export const { removeAll, removeFilters, setFilter } = filterSlice.actions;
