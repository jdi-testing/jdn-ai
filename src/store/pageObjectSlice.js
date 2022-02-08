import { createSlice } from "@reduxjs/toolkit";
import { simpleSelectLocatorById } from "./selectors";
import { pageObjAdapter } from "./selectors/pageObjectSelectors";

const initialState = {};

const pageObjSlice = createSlice({
  name: "pageObject",
  initialState: pageObjAdapter.getInitialState(initialState),
  reducers: {
    addPageObj(state, {payload}) {
      pageObjAdapter.addOne(state, payload);
    },
    addLocatorToPageObj(state, {payload}) {
      const {pageObjId, locatorId} = payload;
      const pageObj = simpleSelectLocatorById(state, pageObjId);
      const locators = [...pageObj.locators || [], locatorId];
      pageObjAdapter.upsertOne(state, {id: pageObjId, locators});
    },
    addLocatorsToPageObj(state, {payload}) {
      const {pageObjId, locatorIds} = payload;
      const pageObj = simpleSelectLocatorById(state, pageObjId);
      const locators = [...pageObj.locators || [], ...locatorIds];
      pageObjAdapter.upsertOne(state, {id: pageObjId, locators});
    }
  }
});

export default pageObjSlice.reducer;
export const {addPageObj, addLocatorToPageObj, addLocatorsToPageObj} = pageObjSlice.actions;
