import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { selectCurrentPageObject, selectPageObjById } from "../pageObjects/pageObjectSelectors";
import { PageObjectId } from "../pageObjects/pageObjectSlice.types";
import { defaultLibrary } from "../pageObjects/utils/generationClassesMap";
import { Filter, FilterKey } from "./filter.types";
import { ElementClass } from "../pageObjects/utils/generationClassesMap";
import { jdiClassFilterInit } from "./utils/filterSet";
import { selectLocatorById } from "../locators/locatorSelectors";

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
    console.log(library);
    if (!filter) {
      return jdiClassFilterInit(library);
    }
    return filter?.[FilterKey.JDIclassFilter];
  }
);

export const selectDetectedClassesFilter = createSelector(
  (state: RootState) => selectCurrentPageObject(state),
  (state: RootState) => state,
  (pageObj, state) => {
    const classFilterPO = selectClassFiltefByPO(state, pageObj!.id);
    if (pageObj?.locators) {
      const locatorType = new Set(pageObj?.locators.map((locatorId) => selectLocatorById(state, locatorId)?.type));
      return Object.entries(classFilterPO).reduce((result: Record<ElementClass, boolean>, entry) => {
        const [key, value] = entry;
        locatorType.has(key as ElementClass) ? (result[key as ElementClass] = value) : null;
        return result;
      }, {} as Record<ElementClass, boolean>);
    }
    return classFilterPO;
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
