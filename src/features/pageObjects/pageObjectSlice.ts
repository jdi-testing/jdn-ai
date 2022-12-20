import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { pageObjAdapter, simpleSelectPageObjById } from "./pageObjectSelectors";
import { PageObject, PageObjectId, PageObjectState } from "./pageObjectSlice.types";
import { addPageObjReducer } from "./pageObjList/pageObjListHeader/addPageObject";
import { ElementLibrary } from "./utils/generationClassesMap";

const initialState: PageObjectState = {};

const pageObjSlice = createSlice({
  name: "pageObject",
  initialState: pageObjAdapter.getInitialState(initialState),
  reducers: {
    addLocatorToPageObj(state, { payload }) {
      const { pageObjId, locatorId } = payload;
      const pageObj = simpleSelectPageObjById(state, pageObjId);
      if (!pageObj) return;
      const locators = [...(pageObj.locators || []), locatorId];
      pageObjAdapter.upsertOne(state, { id: pageObjId, locators } as PageObject);
    },
    addLocatorsToPageObj(state, { payload }) {
      if (isNil(state.currentPageObject)) return;
      const pageObj = simpleSelectPageObjById(state, state.currentPageObject);
      if (!pageObj) return;
      const locators = [...(pageObj.locators || []), ...payload];
      pageObjAdapter.upsertOne(state, { id: pageObj.id, locators } as PageObject);
    },
    changeName(state, { payload }) {
      const { id, name } = payload;
      pageObjAdapter.upsertOne(state, { id, name } as PageObject);
    },
    changeElementLibrary(state, { payload }: PayloadAction<{ id: PageObjectId; library: ElementLibrary }>) {
      const { id, library } = payload;
      pageObjAdapter.upsertOne(state, { id, library } as PageObject);
    },
    clearLocators(state, { payload }) {
      const id = payload || state.currentPageObject;
      pageObjAdapter.upsertOne(state, { id, locators: undefined } as PageObject);
    },
    removeAll(state) {
      pageObjAdapter.removeAll(state);
    },
    removePageObjects(state, { payload: ids }) {
      pageObjAdapter.removeMany(state, ids);
    },
    removePageObject(state, { payload: id }) {
      pageObjAdapter.removeOne(state, id);
      if (state.currentPageObject === id) state.currentPageObject = undefined;
    },
    setCurrentPageObj(state, { payload }) {
      state.currentPageObject = payload;
    },
    setPageData(state, { payload }: PayloadAction<{ id: PageObjectId; pageData: string }>) {
      pageObjAdapter.upsertOne(state, payload as PageObject);
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
  setPageData,
} = pageObjSlice.actions;
