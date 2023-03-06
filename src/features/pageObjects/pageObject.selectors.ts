import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { chain, get, isNil, last, size } from "lodash";
import { RootState } from "../../app/store/store";
import { locatorTaskStatus } from "../../common/constants/constants";
import { selectClassFilterByPO } from "../filter/filter.selectors";
import { selectLocators } from "../locators/locators.selectors";
import { Locator } from "../locators/types/locator.types";
import { isProgressStatus } from "../locators/utils/locatorGenerationController";
import { PageObject, PageObjectId } from "./types/pageObjectSlice.types";

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

export const selectLocatorsByPageObject = createSelector(
  selectLocators,
  getLocatorsIdsByPO,
  (locByProbability, locByPageObj) => locByProbability.filter((loc) => locByPageObj.includes(loc.element_id))
);

export const selectFilteredLocators = createSelector(
  selectLocatorsByPageObject,
  selectClassFilterByPO,
  (locators, filter) => {
    if (!filter) return locators;
    const _locators = locators?.filter((loc) => {
      const filterValue = filter;
      return Object.hasOwn(filterValue, loc.type) ? get(filterValue, loc.type) : true;
    });
    return _locators;
  }
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
  (elements: Array<Locator> = []) => elements.filter((elem) => elem?.active)
);

export const selectConfirmedLocators = createSelector(selectFilteredLocators, (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.generate && !elem.deleted)
);

// move to loc
export const selectCalculatedByPageObj = createSelector(selectFilteredLocators, (locators: Locator[]) =>
  locators.filter(
    (_loc) => (_loc.locator.taskStatus === locatorTaskStatus.SUCCESS || _loc.isCustomLocator) && !_loc.deleted
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
          el.locator.taskStatus === locatorTaskStatus.REVOKED ||
          el.locator.taskStatus === locatorTaskStatus.FAILURE) &&
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
export const selectInProgressSelectedByPageObject = createSelector(selectInProgressByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectInProgressGenerateByPageObj = createSelector(selectWaitingByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectFailedByPageObject = createSelector(selectFilteredLocators, (elements) =>
  elements.filter((element) => element.locator.taskStatus === locatorTaskStatus.FAILURE)
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

export const selectActiveLocators = createSelector(selectFilteredLocators, (locators) =>
  locators.filter((_loc) => _loc.active)
);

export const selectCheckedLocators = createSelector(selectFilteredLocators, (locators) =>
  locators.filter((_loc) => _loc.generate)
);
