import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
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

export const selectMaxId = createSelector(
    simpleSelectPageObjects,
    (items) => {
      // eslint-disable-next-line
      const res = Math.max.apply(Math, items.map((po) => po.id));
      return res !== -Infinity ? res : null;
    }
);

export const selectLocatorsByPageObject = createSelector(
    selectLocators,
    selectPageObjById,
    (elements, pageObj) => {
      const {locators: locatorIds} = pageObj;
      return locatorIds ? locatorIds.map((id) => elements.find(({element_id}) => element_id === id)) : [];
    }
);

export const selectPageObjLocatorsByProbability = createSelector(
    selectLocatorsByProbability,
    (state, pageObjId) => selectPageObjById(state, pageObjId).locators || [],
    (locByProbability, locByPageObj) => locByProbability.filter((loc) => locByPageObj.includes(loc.element_id))
);

export const selectConfirmedLocators = createSelector(
    selectLocatorsByPageObject,
    (elements) => elements.filter((elem) => elem.generate)
);

export const selectGeneratedLocatorsByPageObj = createSelector(
    selectGeneratedLocators,
    (state, pageObjId) => selectPageObjById(state, pageObjId).locators || [],
    (locators, locByPageObj) =>
      locators.filter((loc) => locByPageObj.includes(loc.element_id))
);

export const selectLocatorByJdnHash = createSelector(
    (state, jdnHash) => selectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
    (state) => selectPageObjById(state, state.pageObject.currentPageObject).locators,
    (locators, pageObjLocators) => locators.find(({element_id}) => pageObjLocators.includes(element_id))
);
