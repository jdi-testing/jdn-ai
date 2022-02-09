import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

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
    });
