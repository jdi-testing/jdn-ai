import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { pageObjAdapter, simpleSelectPageObjById } from "./selectors/pageObjects.selectors";
import { PageObjectState, PageObject, PageObjectId } from "./types/pageObjectSlice.types";
import { ElementId } from "../locators/types/locator.types";
import { addPageObjReducer } from "./reducers/addPageObject.thunk";
import { ElementLibrary } from "../locators/types/generationClasses.types";
import { LocatorType } from "../../common/types/common";

const initialState: PageObjectState = {};

const pageObjSlice = createSlice({
  name: "pageObject",
  initialState: pageObjAdapter.getInitialState(initialState),
  reducers: {
    addLocatorToPageObj(state, { payload }: PayloadAction<{ pageObjId: PageObjectId; locatorId: ElementId }>) {
      const { pageObjId, locatorId } = payload;
      const pageObj = simpleSelectPageObjById(state, pageObjId);
      if (isNil(pageObj)) return;
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
    setLocatorType(state, { payload }: PayloadAction<{ id: PageObjectId; locatorType: LocatorType }>) {
      pageObjAdapter.upsertOne(state, payload as PageObject);
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
  setLocatorType,
  setPageData,
} = pageObjSlice.actions;
