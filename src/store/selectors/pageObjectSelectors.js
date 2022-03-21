import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { size } from "lodash";
import { isProgressStatus } from "../../services/locatorGenerationController";
import { locatorTaskStatus } from "../../utils/constants";
import {
  selectGeneratedLocators,
  selectLocators,
  selectLocatorsByProbability,
  selectPendingLocators,
} from "./locatorSelectors";

export const pageObjAdapter = createEntityAdapter({
  selectId: (pageObj) => pageObj.id,
});

export const { selectAll: selectPageObjects, selectById: selectPageObjById } = pageObjAdapter.getSelectors(
    (state) => state.pageObject
);

export const {
  selectAll: simpleSelectPageObjects,
  selectById: simpleSelectPageObjById,
} = pageObjAdapter.getSelectors();

export const selectMaxId = createSelector(simpleSelectPageObjects, (items) => {
  // eslint-disable-next-line
  const res = Math.max.apply(
      Math,
      items.map((po) => po.id)
  );
  return res !== -Infinity ? res : null;
});

export const selectLocatorsByPageObject = createSelector(selectLocators, selectPageObjById, (elements, pageObj) => {
  const { locators: locatorIds } = pageObj;
  return locatorIds ? locatorIds.map((id) => elements.find(({ element_id }) => element_id === id)) : [];
});

export const selectPageObjLocatorsByProbability = createSelector(
    selectLocatorsByProbability,
    (state, pageObjId) => selectPageObjById(state, pageObjId).locators || [],
    (locByProbability, locByPageObj) => locByProbability.filter((loc) => locByPageObj.includes(loc.element_id))
);

export const selectConfirmedLocators = createSelector(selectLocators, selectPageObjById, (elements, pageObj) => {
  const { confirmedLocators: locatorIds } = pageObj;
  return locatorIds ? locatorIds.map((id) => elements.find(({ element_id }) => element_id === id)) : [];
});

export const selectGeneratedByPageObj = createSelector(
    selectGeneratedLocators,
    (state, pageObjId) => selectPageObjById(state, pageObjId).locators || [],
    (locators, locByPageObj) => locators.filter((loc) => locByPageObj.includes(loc.element_id))
);

export const selectGeneratedSelectedByPageObj = createSelector(selectGeneratedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

export const selectDeletedByPageObj = createSelector(selectPageObjLocatorsByProbability, (items) =>
  items.filter((el) => el.deleted)
);

export const selectDeletedSelectedByPageObj = createSelector(selectDeletedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

export const selectWaitingByPageObj = createSelector(selectPageObjLocatorsByProbability, (elements) =>
  elements.filter(
      (el) =>
        (isProgressStatus(el.locator.taskStatus) ||
        el.locator.taskStatus === locatorTaskStatus.REVOKED ||
        el.locator.taskStatus === locatorTaskStatus.FAILURE) &&
      !el.deleted
  )
);

export const selectWaitingSelectedByPageObj = createSelector(selectWaitingByPageObj, (items) =>
  items.filter((item) => item.generate)
);

export const selectLocatorByJdnHash = createSelector(
    (state, jdnHash) => selectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
    (state) => selectPageObjById(state, state.pageObject.currentPageObject).locators,
    (locators, pageObjLocators) => locators.find(({ element_id }) => pageObjLocators.includes(element_id))
);

export const selectPendingLocatorsByPageObj = createSelector(
    selectPendingLocators,
    (state) => selectPageObjById(state, state.pageObject.currentPageObject).locators,
    (locators, pageObjLocators) => locators.filter(({ element_id }) => pageObjLocators.includes(element_id))
);

export const selectLocatorsToConfirm = createSelector(selectLocatorsByPageObject, (elements) =>
  elements.filter((elem) => elem.generate && !elem.deleted)
);

export const selectEmptyPOs = createSelector(simpleSelectPageObjects, (items) =>
  items.filter((item) => !size(item.confirmedLocators))
);
