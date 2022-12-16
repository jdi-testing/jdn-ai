import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { predictElements } from "../../../../pageServices/pageDataHandlers";
import { IdentificationStatus, LocatorsState, PredictedEntity } from "../../../locators/locatorSlice.types";
import { setCurrentPageObj, setPageData } from "../../pageObjectSlice";
import { PageObjectId } from "../../pageObjectSlice.types";
import { ElementLibrary, predictEndpoints } from "../../utils/generationClassesMap";

import { generateLocators } from "./generateLocators";
import { findByRules } from "./utils";

interface Meta {
  library: ElementLibrary;
  pageObj: PageObjectId;
}

export const identifyElements = createAsyncThunk(
  "locators/identifyElements",
  async ({ library, pageObj }: Meta, thunkAPI) => {
    thunkAPI.dispatch(setCurrentPageObj(pageObj));

    try {
      const endpoint = predictEndpoints[library];
      const { data: res, pageData } =
        library !== ElementLibrary.Vuetify ? await predictElements(endpoint) : await findByRules();
      const byPageObject = res.map((el: PredictedEntity) => ({
        ...el,
        element_id: `${el.element_id}_${pageObj}`,
        jdnHash: el.element_id,
      }));
      thunkAPI.dispatch(generateLocators({ predictedElements: byPageObject, library }));
      thunkAPI.dispatch(setPageData({ id: pageObj, pageData }));
      return thunkAPI.fulfillWithValue(byPageObject);
    } catch (error) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);

export const identifyElementsReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(identifyElements.pending, (state) => {
      state.status = IdentificationStatus.loading;
    })
    .addCase(identifyElements.fulfilled, (state) => {
      state.status = IdentificationStatus.success;
    })
    .addCase(identifyElements.rejected, (state) => {
      state.status = IdentificationStatus.error;
    });
};
