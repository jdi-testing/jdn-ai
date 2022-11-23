import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PageObjectId } from "../pageObjects/pageObjectSlice.types";
import { ElementClass, ElementLibrary } from "../pageObjects/utils/generationClassesMap";
import { FilterKey } from "./filter.types";
import { filterAdapter, simpleSelectFilterById } from "./filterSelectors";
import { jdiClassFilterInit } from "./utils/filterSet";

const filterSlice = createSlice({
  name: "filter",
  initialState: filterAdapter.getInitialState({}),
  reducers: {
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
  },
});

export default filterSlice.reducer;
export const { toggleClassFilter } = filterSlice.actions;
