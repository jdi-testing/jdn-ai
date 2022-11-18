import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { predictElements } from "../../../../pageServices/pageDataHandlers";
import { IdentificationStatus, LocatorsState, PredictedEntity } from "../../../locators/locatorSlice.types";
import { setCurrentPageObj, setPageData } from "../../pageObjectSlice";
import { PageObjectId } from "../../pageObjectSlice.types";
import { ElementLibrary, predictEndpoints } from "../../utils/generationClassesMap";

import { generateLocators } from "./generateLocators";

interface Meta {
  library: ElementLibrary;
  pageObj: PageObjectId;
}

export const identifyElements = createAsyncThunk(
    "locators/identifyElements",
    async ({ library, pageObj }: Meta, thunkAPI) => {
      thunkAPI.dispatch(setCurrentPageObj(pageObj));

      const endpoint = predictEndpoints[library];
      try {
        const { data: res, pageData } = await predictElements(endpoint);
        const rounded = res.map((el: PredictedEntity) => ({
          ...el,
          element_id: `${el.element_id}_${pageObj}`,
          jdnHash: el.element_id,
          predicted_probability: Math.round(el.predicted_probability * 100) / 100,
        }));
        thunkAPI.dispatch(generateLocators({ predictedElements: rounded, library }));
        thunkAPI.dispatch(setPageData({ id: pageObj, pageData }));
        return thunkAPI.fulfillWithValue(rounded);
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
