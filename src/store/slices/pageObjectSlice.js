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
    addLocatorToPageObj(state, { payload }) {
      const { pageObjId, locatorId } = payload;
      const pageObj = simpleSelectPageObjById(state, pageObjId);
      const locators = [...(pageObj.locators || []), locatorId];
      pageObjAdapter.upsertOne(state, { id: pageObjId, locators });
    },
    addLocatorsToPageObj(state, { payload }) {
      const pageObj = simpleSelectPageObjById(state, state.currentPageObject);
      const locators = [...(pageObj.locators || []), ...payload];
      pageObjAdapter.upsertOne(state, { id: pageObj.id, locators });
    },
    changeName(state, { payload }) {
      const { id, name } = payload;
      pageObjAdapter.upsertOne(state, { id, name });
    },
    changeElementLibrary(state, { payload }) {
      const { id, library } = payload;
      pageObjAdapter.upsertOne(state, { id, library });
    },
    clearLocators(state, { payload }) {
      const id = payload || state.currentPageObject;
      pageObjAdapter.upsertOne(state, { id, locators: [] });
    },
    removeAll(state) {
      pageObjAdapter.removeAll(state);
    },
    removePageObjects(state, { payload: ids }) {
      pageObjAdapter.removeMany(state, ids);
    },
    removePageObject(state, { payload: id }) {
      pageObjAdapter.removeOne(state, id);
    },
    setCurrentPageObj(state, { payload }) {
      state.currentPageObject = payload;
    },
  },
  extraReducers: (builder) => {
    addPageObjReducer(builder);
  },
});

export default pageObjSlice.reducer;
export const {
  addLocatorToPageObj,
  addLocatorsToPageObj,
  changeElementLibrary,
  changeName,
  clearLocators,
  removeAll,
  removePageObjects,
  removePageObject,
  setCurrentPageObj,
} = pageObjSlice.actions;
