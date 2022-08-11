import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { chain, size } from "lodash";
import { isProgressStatus } from "../../services/locatorGenerationController";
import { locatorTaskStatus } from "../../utils/constants";
import { selectGeneratedLocators, selectLocators, selectLocatorsByProbability } from "./locatorSelectors";

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

export const selectLocatorsToConfirm = createSelector(selectLocatorsByPageObject, (elements) =>
  elements.filter((elem) => elem.generate && !elem.deleted)
);

export const selectConfirmedLocators = selectLocatorsToConfirm;

export const selectGeneratedByPageObj = createSelector(
    selectGeneratedLocators,
    (state, pageObjId) => selectPageObjById(state, pageObjId).locators || [],
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
      .filter((el) => el.deleted)
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

export const selectLocatorByJdnHash = createSelector(
    (state, jdnHash) => selectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
    (state) => selectPageObjById(state, state.pageObject.currentPageObject).locators,
    (locators, pageObjLocators) => locators.find(({ element_id }) => pageObjLocators.includes(element_id))
);

export const selectEmptyPageObjects = createSelector(
    selectPageObjects,
    (state) => state,
    (pageObjects, state) => {
      const emptyPOs = [];
      if (pageObjects) {
        pageObjects.forEach((po) => {
          const loc = selectConfirmedLocators(state, po.id);
          if (!size(loc)) emptyPOs.push(po.id);
        });
      }
      return emptyPOs;
    }
);
