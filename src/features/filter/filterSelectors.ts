import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { selectCurrentPageObject, selectPageObjById } from "../pageObjects/pageObjectSelectors";
import { PageObjectId } from "../pageObjects/pageObjectSlice.types";
import { defaultLibrary } from "../pageObjects/utils/generationClassesMap";
import { Filter, FilterKey } from "./filter.types";
import { jdiClassFilterInit } from "./utils/filterSet";

export const filterAdapter = createEntityAdapter<Filter>({
  selectId: (filter) => filter.pageObjectId,
});

export const { selectAll: simpleSelectFilters, selectById: simpleSelectFilterById } = filterAdapter.getSelectors();

export const { selectAll: selectFilters, selectById: selectFilterById } = filterAdapter.getSelectors<RootState>(
  (state) => state.filters
);

export const selectClassFiltefByPO = createSelector(
  selectFilterById,
  (state: RootState, id: PageObjectId) => selectPageObjById(state, id)?.library,
  (filter, library = defaultLibrary) => {
    if (!filter) {
      return jdiClassFilterInit(library);
    }
    return filter?.[FilterKey.JDIclassFilter];
  }
);

export const selectAvailableClasses = createSelector(
  (state: RootState) => selectClassFiltefByPO(state, selectCurrentPageObject(state)?.id || ""),
  (classFilter) => {
    return Object.entries(classFilter)
      .map(([jdiClass, value]) => (value ? jdiClass : null))
      .filter((jdiClass) => !!jdiClass);
  }
);
