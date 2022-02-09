import { createSlice } from "@reduxjs/toolkit";
import { simpleSelectLocatorById } from "./selectors";
import { pageObjAdapter } from "./selectors/pageObjectSelectors";
import { addPageObjReducer } from "./thunks/addPageObject";

const initialState = {};

const pageObjSlice = createSlice({
  name: "pageObject",
  initialState: pageObjAdapter.getInitialState(initialState),
  reducers: {
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
  },
  extraReducers: (builder) => {
    addPageObjReducer(builder);
  }

});

export default pageObjSlice.reducer;
export const {addLocatorToPageObj, addLocatorsToPageObj} = pageObjSlice.actions;
