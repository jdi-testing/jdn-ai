import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store/store";
import { selectCurrentPageObject, selectPageObjById } from "../pageObjects/selectors/pageObjects.selectors";
import { PageObjectId } from "../pageObjects/types/pageObjectSlice.types";
import { defaultLibrary } from "../locators/types/generationClasses.types";
import { Filter, FilterKey } from "./types/filter.types";
import { ElementClass } from "../locators/types/generationClasses.types";
import { jdiClassFilterInit } from "./utils/filterSet";
import { selectLocatorById } from "../locators/selectors/locators.selectors";
import { isNil } from "lodash";
import { hasFalseValue } from "./utils/hasFalseValue";

export const filterAdapter = createEntityAdapter<Filter>({
  selectId: (filter) => filter.pageObjectId,
});

export const { selectAll: simpleSelectFilters, selectById: simpleSelectFilterById } = filterAdapter.getSelectors();

export const { selectAll: selectFilters, selectById: selectFilterById } = filterAdapter.getSelectors<RootState>(
  (state) => state.filters
);

export const selectClassFilterByPO = createSelector(
  (state: RootState, id?: PageObjectId) => {
    const pageObject = !isNil(id) ? selectPageObjById(state, id) : selectCurrentPageObject(state);
    const filter = selectFilters(state).find(({ pageObjectId }: Filter) => pageObjectId === pageObject?.id);
    return { filter, library: pageObject?.library };
  },
  ({ filter, library }) => {
    if (!filter) {
      return jdiClassFilterInit(library || defaultLibrary);
    }
    return filter?.[FilterKey.JDIclassFilter];
  }
);

export const selectDetectedClassesFilter = createSelector(
  (state: RootState) => selectCurrentPageObject(state),
  (state: RootState) => state,
  (pageObj, state) => {
    const classFilterPO = selectClassFilterByPO(state, pageObj?.id);
    if (pageObj?.locators) {
      const locatorType = new Set(pageObj?.locators.map((locatorId) => selectLocatorById(state, locatorId)?.type));
      return Object.entries(classFilterPO).reduce(
        (result: Record<ElementClass, boolean>, entry) => {
          const [key, value] = entry;
          locatorType.has(key as ElementClass) ? (result[key as ElementClass] = value as boolean) : null;
          return result;
        },
        {} as Record<ElementClass, boolean>
      );
    }
    return classFilterPO;
  }
);

export const selectAvailableClasses = createSelector(
  (state: RootState) => selectClassFilterByPO(state, selectCurrentPageObject(state)?.id),
  (classFilter) => {
    return Object.entries(classFilter)
      .map(([jdiClass, value]) => (value ? jdiClass : null))
      .filter((jdiClass) => !!jdiClass);
  }
);

export const selectIfSelectedAll = createSelector(selectDetectedClassesFilter, (classFilter) => {
  const arr = Object.entries(classFilter);
  return !arr.some(([, value]) => !value);
});

export const selectIfUnselectedAll = createSelector(selectDetectedClassesFilter, (classFilter) => {
  const arr = Object.entries(classFilter);
  return arr.every(([, value]) => !value);
});

export const selectIsFiltered = createSelector(selectDetectedClassesFilter, (classFilter) =>
  hasFalseValue(classFilter)
);
