import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { isNil, last } from "lodash";
import { RootState } from "../../../app/store/store";
import { PageObject } from "../types/pageObjectSlice.types";
import { AUTO_GENERATION_TRESHOLD } from "../../locators/utils/constants";
import { LocatorType } from "../../../common/types/common";
import { PredictedEntity } from "../../locators/types/locator.types";

export const pageObjAdapter = createEntityAdapter<PageObject>({
  selectId: (pageObj) => pageObj.id,
});

export const { selectAll: selectPageObjects, selectById: selectPageObjById } = pageObjAdapter.getSelectors(
  (state: RootState) => state.pageObject.present
);

export const {
  selectAll: simpleSelectPageObjects,
  selectById: simpleSelectPageObjById,
} = pageObjAdapter.getSelectors();

export const selectCurrentPageObject = (state: RootState) => {
  const currentPageObj = state.pageObject.present.currentPageObject;
  if (!isNil(currentPageObj)) return selectPageObjById(state, currentPageObj);
  return undefined;
};

export const selectMaxId = createSelector(simpleSelectPageObjects, (items) => {
  // eslint-disable-next-line
  const res = Math.max.apply(
    Math,
    items.map((po) => po.id)
  );
  return res !== -Infinity ? res : null;
});

export const selectLastElementLibrary = createSelector(selectPageObjects, (pageObjects) => last(pageObjects)?.library);

export const selectLastLocatorType = createSelector(selectPageObjects, (pageObjects) => last(pageObjects)?.locatorType);

export const selectAutoGeneratingLocatorTypes = createSelector(
  selectCurrentPageObject,
  (_: RootState, locators?: any[]) => locators,
  (pageObj, locators) => {
    if (!pageObj)
      return {
        generateCssSelector: false,
        generateXpath: false,
      };

    locators = locators || pageObj.locators;

    const isLowerTreshold = (locators?.length || 0) <= AUTO_GENERATION_TRESHOLD;

    return {
      generateCssSelector:
        isLowerTreshold || (!pageObj.hideUnadded && pageObj.locatorType === LocatorType.cssSelector),
      generateXpath: isLowerTreshold || (!pageObj.hideUnadded && pageObj.locatorType === LocatorType.xPath),
    };
  }
);
