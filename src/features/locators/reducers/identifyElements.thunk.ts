import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { predictElements } from "../../../pageServices/pageDataHandlers";
import { IdentificationStatus, LocatorsState, PredictedEntity } from "../../locators/types/locator.types";
import { setCurrentPageObj, setPageData } from "../../pageObjects/pageObject.slice";
import { setFilter } from "../../filter/filter.slice";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementLibrary, defaultLibrary, predictEndpoints } from "../types/generationClasses.types";

import { createLocators } from "./createLocators.thunk";
import { findByRules } from "../utils/generationButton";
import { LocalStorageKey, getLocalStorage } from "../../../common/utils/localStorage";
import { selectAutoGeneratingLocatorTypes, selectPageObjById } from "../../pageObjects/selectors/pageObjects.selectors";
import { RootState } from "../../../app/store/store";
import { runLocatorsGeneration } from "./runLocatorsGeneration.thunk";

interface Meta {
  library: ElementLibrary;
  pageObj: PageObjectId;
}

export const identifyElements = createAsyncThunk("locators/identifyElements", async ({ pageObj }: Meta, thunkAPI) => {
  thunkAPI.dispatch(setCurrentPageObj(pageObj));
  const state = thunkAPI.getState() as RootState;
  const library = selectPageObjById(state, pageObj)?.library || defaultLibrary;
  const savedFilters = getLocalStorage(LocalStorageKey.Filter);

  if (savedFilters && savedFilters[library]) {
    thunkAPI.dispatch(setFilter({ pageObjectId: pageObj, JDIclassFilter: savedFilters[library] }));
  }

  try {
    const endpoint = predictEndpoints[library];
    const { data: res, pageData } =
      library !== ElementLibrary.Vuetify ? await predictElements(endpoint) : await findByRules();
    const locators = res.map((el: PredictedEntity) => ({
      ...el,
      element_id: `${el.element_id}_${pageObj}`,
      jdnHash: el.element_id,
      pageObj: pageObj,
    }));

    thunkAPI.dispatch(setPageData({ id: pageObj, pageData }));
    thunkAPI.dispatch(createLocators({ predictedElements: locators, library }));

    const isAutogenerating = selectAutoGeneratingLocatorTypes(state as RootState, locators);
    thunkAPI.dispatch(runLocatorsGeneration({ locators, ...isAutogenerating }));

    return thunkAPI.fulfillWithValue(locators);
  } catch (error) {
    return thunkAPI.rejectWithValue(null);
  }
});

export const identifyElementsReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(identifyElements.pending, (state) => {
      state.status = IdentificationStatus.loading;
    })
    .addCase(identifyElements.fulfilled, (state, { payload }) => {
      // @ts-ignore
      if (payload.length) state.status = IdentificationStatus.preparing;
      else state.status = IdentificationStatus.noElements;
    })
    .addCase(identifyElements.rejected, (state) => {
      state.status = IdentificationStatus.error;
    });
};
