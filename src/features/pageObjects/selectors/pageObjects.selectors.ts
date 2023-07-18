import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { isNil, last } from "lodash";
import { RootState } from "../../../app/store/store";
import { PageObject } from "../types/pageObjectSlice.types";

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

export const selectLastAnnotationType = createSelector(
  selectPageObjects,
  (pageObjects) => last(pageObjects)?.annotationType
);
