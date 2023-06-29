import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { chain, isNil, last, size } from "lodash";
import { RootState } from "../../app/store/store";
import { selectClassFilterByPO } from "../filter/filter.selectors";
import { isValidLocator } from "../locators/utils/utils";
import { selectLocatorById, selectLocators } from "../locators/locators.selectors";
import { Locator, LocatorTaskStatus } from "../locators/types/locator.types";
import { LocatorType } from "../../common/types/common";
import { isProgressStatus } from "../locators/utils/locatorGenerationController";
import { getLocator } from "../locators/utils/locatorOutput";
import { PageObject, PageObjectId } from "./types/pageObjectSlice.types";
import { filterLocatorsByClassFilter } from "../locators/utils/filterLocators";
import { sortLocatorsWithChildren } from "../locators/utils/sortLocators";

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

const selectSortedLocators = createSelector(selectLocatorsByPageObject, (locators) =>
  sortLocatorsWithChildren(locators)
);

export const selectFilteredLocators = createSelector(
  selectLocatorsByPageObject,
  selectClassFilterByPO,
  filterLocatorsByClassFilter
);

const selectSortedFilteredLocators = createSelector(
  selectSortedLocators,
  selectClassFilterByPO,
  filterLocatorsByClassFilter
);

export const selectGenerateByPageObject = createSelector(selectFilteredLocators, (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.generate)
);

export const selectActiveGenerateByPO = createSelector(selectGenerateByPageObject, (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.active)
);

export const selectNonGenerateByPageObject = createSelector(selectFilteredLocators, (elements: Array<Locator> = []) =>
  elements.filter((elem) => !elem?.generate)
);

export const selectActiveNonGenerateByPO = createSelector(
  selectNonGenerateByPageObject,
  (elements: Array<Locator> = []) => elements.filter((elem) => elem?.active && !elem.deleted)
);

export const selectConfirmedLocators = createSelector(selectSortedFilteredLocators, (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.generate && !elem.deleted)
);

// move to loc
export const selectCalculatedByPageObj = createSelector(selectFilteredLocators, (locators: Locator[]) =>
  locators.filter(
    (_loc) => (_loc.locator.taskStatus === LocatorTaskStatus.SUCCESS || _loc.isCustomLocator) && !_loc.deleted
  )
);

// move to loc
export const selectCalculatedActiveByPageObj = createSelector(selectCalculatedByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active)
);

// move to loc
export const selectCalculatedGenerateByPageObj = createSelector(selectCalculatedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectDeletedByPageObj = createSelector(selectFilteredLocators, (items) =>
  chain(items)
    .filter((el) => el.deleted || false)
    .value()
);

// move to loc
export const selectDeletedGenerateByPageObj = createSelector(selectDeletedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectDeletedActiveByPageObj = createSelector(selectDeletedByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active)
);

export const selectWaitingByPageObj = createSelector(selectFilteredLocators, (elements) =>
  chain(elements)
    .filter(
      (el) =>
        (isProgressStatus(el.locator.taskStatus) ||
          el.locator.taskStatus === LocatorTaskStatus.REVOKED ||
          el.locator.taskStatus === LocatorTaskStatus.FAILURE) &&
        !el.deleted
    )
    .value()
);

// move to loc
export const selectWaitingActiveByPageObj = createSelector(selectWaitingByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active)
);

// move to loc
export const selectInProgressByPageObj = createSelector(selectFilteredLocators, (elements) =>
  chain(elements)
    .filter((el) => isProgressStatus(el.locator.taskStatus) && !el.deleted)
    .value()
);

// move to loc
export const selectInProgressActiveByPageObject = createSelector(selectInProgressByPageObj, (items) =>
  items.filter((item) => item.active)
);

// move to loc
export const selectInProgressGenerateByPageObj = createSelector(selectWaitingByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectFailedByPageObject = createSelector(selectFilteredLocators, (elements) =>
  elements.filter((element) => element.locator.taskStatus === LocatorTaskStatus.FAILURE)
);

export const selectFailedSelectedByPageObject = createSelector(selectFailedByPageObject, (elements) =>
  elements.filter((element) => element.active)
);

// move to loc
export const selectLocatorByJdnHash = createSelector(
  (state: RootState, jdnHash: string) => selectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
  (state: RootState) => selectCurrentPageObject(state)?.locators,
  (locators, pageObjLocators) => {
    return locators.find(({ element_id }) => pageObjLocators?.includes(element_id));
  }
);

export const selectEmptyPageObjects = createSelector(
  selectPageObjects,
  (state: RootState) => state,
  (pageObjects, state) => {
    const emptyPOs: PageObjectId[] = [];
    if (pageObjects) {
      pageObjects.forEach((po) => {
        const loc = selectConfirmedLocators(state, po.id);
        if (!size(loc)) emptyPOs.push(po.id);
      });
    }
    return emptyPOs;
  }
);

export const selectLastElementLibrary = createSelector(selectPageObjects, (pageObjects) => last(pageObjects)?.library);

export const selectLastLocatorType = createSelector(selectPageObjects, (pageObjects) => last(pageObjects)?.locatorType);

export const selectActiveLocators = createSelector(selectFilteredLocators, (locators) =>
  locators.filter((_loc) => _loc.active)
);

export const selectCheckedLocators = createSelector(selectFilteredLocators, (locators) =>
  locators.filter((_loc) => _loc.generate)
);

export const selectValidLocators = createSelector(selectLocatorsByPageObject, (locators) =>
  locators.filter((loc) => isValidLocator(loc.message))
);
