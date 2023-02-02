import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PageObjectId } from "../pageObjects/types/pageObjectSlice.types";
import { ElementClass, ElementLibrary } from "../locators/types/generationClassesMap";
import { FilterKey } from "./types/filter.types";
import { filterAdapter, simpleSelectFilterById } from "./filter.selectors";
import { jdiClassFilterInit } from "./utils/filterSet";

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
    toggleClassFilter(
      state,
      {
        payload, // eslint-disable-next-line max-len
      }: PayloadAction<{ pageObjectId: PageObjectId; library: ElementLibrary; jdiClass: ElementClass; value: boolean }>
    ) {
      const { pageObjectId, jdiClass, value, library } = payload;
      const newValue = simpleSelectFilterById(state, pageObjectId);
      if (newValue) {
        const newFilter = { ...newValue[FilterKey.JDIclassFilter], [jdiClass]: value };
        filterAdapter.upsertOne(state, { ...newValue, [FilterKey.JDIclassFilter]: newFilter });
      } else {
        const initialFilter = jdiClassFilterInit(library);
        filterAdapter.addOne(state, {
          pageObjectId,
          [FilterKey.JDIclassFilter]: { ...initialFilter, [jdiClass]: value },
        });
      }
    },
    toggleClassFilterAll(
      state,
      { payload }: PayloadAction<{ pageObjectId: PageObjectId; library: ElementLibrary; value: boolean }>
    ) {
      const { pageObjectId, value, library } = payload;
      let newValue = simpleSelectFilterById(state, pageObjectId);
      if (!newValue) {
        newValue = { pageObjectId, [FilterKey.JDIclassFilter]: jdiClassFilterInit(library) };
      }
      const filter = { ...newValue[FilterKey.JDIclassFilter] };
      // don't know how to fix it
      // eslint-disable-next-line
      // @ts-ignore
      Object.keys(filter).forEach((key) => (filter[key] = value));
      filterAdapter.upsertOne(state, { ...newValue, [FilterKey.JDIclassFilter]: filter });
    },
  },
});

export default filterSlice.reducer;
export const { removeAll, removeFilters, toggleClassFilter, toggleClassFilterAll } = filterSlice.actions;
