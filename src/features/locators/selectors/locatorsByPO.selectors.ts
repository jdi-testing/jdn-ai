import { createSelector } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { RootState } from "../../../app/store/store";
import { selectCurrentPageObject, selectPageObjById } from "../../pageObjects/selectors/pageObjects.selectors";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { getLocator } from "../utils/locatorOutput";
import { sortLocatorsWithChildren } from "../utils/sortLocators";
import { selectLocatorById, selectLocators } from "./locators.selectors";
import { isValidLocator } from "../utils/utils";

export const getLocatorsIdsByPO = (state: RootState, pageObjId?: PageObjectId) => {
  pageObjId = isNil(pageObjId) ? selectCurrentPageObject(state)?.id : pageObjId;
  if (isNil(pageObjId)) return [];
  return selectPageObjById(state, pageObjId)?.locators || [];
};

export const selectFirstLocatorIdByPO = createSelector(getLocatorsIdsByPO, (locatorsIds) => locatorsIds[0]);

export const selectFirstLocatorByPO = createSelector(
  (state: RootState) => selectLocatorById(state, selectFirstLocatorIdByPO(state)),
  (loc) => loc
);

// for highlight purposes use selectors based on this one
export const selectPresentLocatorsByPO = createSelector(
  selectLocators,
  (state: RootState, pageObjId?: PageObjectId) =>
    isNil(pageObjId) ? selectCurrentPageObject(state) : selectPageObjById(state, pageObjId),
  (locators, pageObject) => {
    const locByPageObj = pageObject?.locators || [];
    return locators
      .filter((loc) => locByPageObj.includes(loc.element_id))
      .map((loc) => {
        return {
          ...loc,
          locatorType: loc.locatorType || pageObject?.locatorType,
          annotationType: loc.annotationType || pageObject?.annotationType,
          locator: { ...loc.locator, output: getLocator(loc.locator, pageObject?.locatorType) },
        };
      });
  }
);

export const selectLocatorsByPageObject = createSelector(
  selectPresentLocatorsByPO,
  (state: RootState, pageObjId?: PageObjectId) =>
    isNil(pageObjId) ? selectCurrentPageObject(state) : selectPageObjById(state, pageObjId),
  (locators, pageObj) => {
    const hideUnadded = pageObj?.hideUnadded;
    return hideUnadded ? locators.filter((loc) => loc.generate || loc.active) : locators;
  }
);

export const selectSortedLocators = createSelector(selectLocatorsByPageObject, (locators) =>
  sortLocatorsWithChildren(locators)
);

export const selectValidLocators = createSelector(selectPresentLocatorsByPO, (locators) =>
  locators.filter((loc) => isValidLocator(loc.message))
);

export const selectPresentActiveLocators = createSelector(selectPresentLocatorsByPO, (locators) =>
  locators.filter((loc) => loc.active)
);
