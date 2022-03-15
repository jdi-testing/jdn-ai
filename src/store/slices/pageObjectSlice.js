import { createSlice } from "@reduxjs/toolkit";
import { pageObjAdapter, selectEmptyPOs, simpleSelectPageObjById } from "../selectors/pageObjectSelectors";
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
    clearLocators(state, { payload }) {
      const id = payload || state.currentPageObject;
      pageObjAdapter.upsertOne(state, { id, locators: [] });
    },
    confirmLocators(state, { payload }) {
      const { id, locatorIds } = payload;
      pageObjAdapter.upsertOne(state, { id, confirmedLocators: locatorIds });
    },
    removeAll(state) {
      pageObjAdapter.removeAll(state);
    },
    removeEmptyPOs(state) {
      const emptyPOids = selectEmptyPOs(state).map((item) => item.id);
      pageObjAdapter.removeMany(state, emptyPOids);
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
  clearLocators,
  confirmLocators,
  removeAll,
  removeEmptyPOs,
  removePageObject,
  setCurrentPageObj,
} = pageObjSlice.actions;
