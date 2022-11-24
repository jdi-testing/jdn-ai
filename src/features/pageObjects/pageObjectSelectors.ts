import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { chain, get, isNil, last, size } from "lodash";
import { RootState } from "../../app/store";
import { locatorTaskStatus } from "../../common/constants/constants";
import { FilterKey } from "../filter/filter.types";
import { selectFilterById } from "../filter/filterSelectors";
import { isProgressStatus } from "../locators/locatorGenerationController";
import { selectGeneratedLocators, selectLocators, selectLocatorsByProbability } from "../locators/locatorSelectors";
import { Locator } from "../locators/locatorSlice.types";
import { PageObject, PageObjectId } from "./pageObjectSlice.types";

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

export const selectLocatorsByPageObject = createSelector(selectLocators, selectPageObjById, (elements, pageObj) => {
  if (!pageObj) return;
  const { locators: locatorIds } = pageObj;
  if (!locatorIds || !size(locatorIds)) return;
  return chain(locatorIds)
      .map((id) => elements.find(({ element_id }) => element_id === id))
      .compact()
      .value();
});

export const selectPageObjLocatorsByProbability = createSelector(
    selectLocatorsByProbability,
    (state: RootState, pageObjId: PageObjectId) => selectPageObjById(state, pageObjId)?.locators || [],
    (locByProbability, locByPageObj) => locByProbability.filter((loc) => locByPageObj.includes(loc.element_id))
);

export const selectFilteredLocators = createSelector(
    selectLocatorsByPageObject,
    selectFilterById,
    (locators, filter) => {
      if (!filter) return locators;
      const _locators = locators?.filter((loc) => {
        const filterValue = filter[FilterKey.JDIclassFilter];
        return Object.hasOwn(filterValue, loc.type) ? get(filterValue, loc.type) : true;
      });
      return _locators;
    }
);

const filterConfirmedLocators = (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.generate && !elem.deleted);

export const selectLocatorsToConfirm = createSelector(selectLocatorsByPageObject, filterConfirmedLocators);

export const selectFilteredConfirmedLocators = createSelector(selectFilteredLocators, filterConfirmedLocators);

export const selectConfirmedLocators = selectFilteredConfirmedLocators;

export const selectGeneratedByPageObj = createSelector(
    selectGeneratedLocators,
    (state: RootState, pageObjId: PageObjectId) => selectPageObjById(state, pageObjId)?.locators || [],
    (locators, locByPageObj) =>
      chain(locators)
          .filter((loc) => locByPageObj.includes(loc.element_id))
          .value()
);

export const selectGeneratedSelectedByPageObj = createSelector(selectGeneratedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

export const selectDeletedByPageObj = createSelector(selectPageObjLocatorsByProbability, (items) =>
  chain(items)
      .filter((el) => el.deleted || false)
      .value()
);

export const selectDeletedSelectedByPageObj = createSelector(selectDeletedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

export const selectWaitingByPageObj = createSelector(selectPageObjLocatorsByProbability, (elements) =>
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

export const selectInProgressByPageObj = createSelector(selectPageObjLocatorsByProbability, (elements) =>
  chain(elements)
      .filter((el) => isProgressStatus(el.locator.taskStatus) && !el.deleted)
      .value()
);

export const selectInProgressSelectedByPageObject = createSelector(selectInProgressByPageObj, (items) =>
  items.filter((item) => item.generate)
);

export const selectWaitingSelectedByPageObj = createSelector(selectWaitingByPageObj, (items) =>
  items.filter((item) => item.generate)
);

export const selectFailedByPageObject = createSelector(selectPageObjLocatorsByProbability, (elements) =>
  elements.filter((element) => element.locator.taskStatus === locatorTaskStatus.FAILURE)
);

export const selectLocatorByJdnHash = createSelector(
    (state: RootState, jdnHash: string) => selectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
    (state: RootState) => {
      if (isNil(state.pageObject.present.currentPageObject)) return [];
      const pageObject = selectPageObjById(state, state.pageObject.present.currentPageObject);
      return pageObject ? pageObject.locators : [];
    },
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
