import { createSlice } from "@reduxjs/toolkit";
import { pageObjAdapter, simpleSelectPageObjById } from "../selectors/pageObjectSelectors";
import { addPageObjReducer } from "../thunks/addPageObject";

const initialState = {
  currentPageObject: null,
};

const pageObjSlice = createSlice({
  name: "pageObject",
  initialState: pageObjAdapter.getInitialState(initialState),
  reducers: {
    addLocatorToPageObj(state, {payload}) {
      const {pageObjId, locatorId} = payload;
      const pageObj = simpleSelectPageObjById(state, pageObjId);
      const locators = [...pageObj.locators || [], locatorId];
      pageObjAdapter.upsertOne(state, {id: pageObjId, locators});
    },
    addLocatorsToPageObj(state, {payload}) {
      const pageObj = simpleSelectPageObjById(state, state.currentPageObject);
      const locators = [...pageObj.locators || [], ...payload];
      pageObjAdapter.upsertOne(state, {id: pageObj.id, locators});
    },
    setConfirmed(state, {payload}) {
      pageObjAdapter.upsertOne(state, {id: payload, confirmed: true});
    },
    setCurrentPageObj(state, {payload}) {
      state.currentPageObject = payload;
    },
  },
  extraReducers: (builder) => {
    addPageObjReducer(builder);
  }

});

export default pageObjSlice.reducer;
export const {addLocatorToPageObj, addLocatorsToPageObj, setConfirmed, setCurrentPageObj} = pageObjSlice.actions;
