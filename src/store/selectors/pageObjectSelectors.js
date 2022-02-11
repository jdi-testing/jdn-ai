import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { selectLocators } from "../selectors";

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

export const selectMaxId = createSelector(simpleSelectPageObjects,
    (items) => {
      // eslint-disable-next-line
      const res = Math.max.apply(Math, items.map((po) => po.id));
      return res !== -Infinity ? res : null;
    }
);

export const selectLocatorsByPageObject = createSelector(
    selectLocators,
    (state, pageObjId) => {
      return selectPageObjById(state, pageObjId);
    },
    (elements, pageObj) => {
      const {locators: locatorIds} = pageObj;
      return locatorIds.map((id) => elements.find(({element_id}) => element_id === id));
    }
);

export const selectConfirmedLocators = createSelector(
    selectLocatorsByPageObject,
    (elements, pageObj) => {
      return elements.filter((elem) => elem.generate);
    }
);
