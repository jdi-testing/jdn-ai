import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";

import { generateLocators } from "./generateLocators";
import { predictElements } from "../../services/pageDataHandlers";
import { setCurrentPageObj } from "../slices/pageObjectSlice";
import { ElementLibrary, predictEndpoints } from "../../components/PageObjects/utils/generationClassesMap";
import { PageObjectId } from "../slices/pageObjectSlice.types";
import { IdentificationStatus, LocatorsState, PredictedEntity } from "../slices/locatorSlice.types";

interface Meta {
  library: ElementLibrary,
  pageObj: PageObjectId,
}

export const identifyElements = createAsyncThunk(
    "locators/identifyElements",
    async ({ library, pageObj }: Meta, thunkAPI) => {
      thunkAPI.dispatch(setCurrentPageObj(pageObj));

      const endpoint = predictEndpoints[library];
      try {
        const res: PredictedEntity[] = await predictElements(endpoint);
        const rounded = res.map((el) => ({
          ...el,
          element_id: `${el.element_id}_${pageObj}`,
          jdnHash: el.element_id,
          predicted_probability: Math.round(el.predicted_probability * 100) / 100,
        }));
        thunkAPI.dispatch(generateLocators({ predictedElements: rounded, library }));
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
