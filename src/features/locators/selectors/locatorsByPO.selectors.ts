import { createSelector } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { RootState } from "../../../app/store/store";
import { LocatorType } from "../../../common/types/common";
import { selectCurrentPageObject, selectPageObjById } from "../../pageObjects/selectors/pageObjects.selectors";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { getLocator } from "../utils/locatorOutput";
import { sortLocatorsWithChildren } from "../utils/sortLocators";
import { selectLocatorById, selectLocators } from "./locators.selectors";

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

export const selectLocatorsByPageObject = createSelector(
  selectLocators,
  (state: RootState, pageObjId?: PageObjectId) =>
    isNil(pageObjId) ? selectCurrentPageObject(state) : selectPageObjById(state, pageObjId),
  (locators, pageObject) => {
    const locByPageObj = pageObject?.locators || [];
    return locators
      .filter((loc) => locByPageObj.includes(loc.element_id))
      .map((loc) =>
        !loc.locatorType && pageObject?.locatorType === LocatorType.cssSelector
          ? {
              ...loc,
              locatorType: pageObject?.locatorType,
              locator: { ...loc.locator, output: getLocator(loc.locator, pageObject?.locatorType) },
            }
          : loc
      );
  }
);

export const selectSortedLocators = createSelector(selectLocatorsByPageObject, (locators) =>
  sortLocatorsWithChildren(locators)
);
