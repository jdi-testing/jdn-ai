import { createAsyncThunk } from "@reduxjs/toolkit";

import { BACKEND_STATUS, identificationStatus } from "../../utils/constants";
import { generateLocators } from "./generateLocators";
import { predictElements } from "../../services/pageDataHandlers";
import { setCurrentPageObj } from "../slices/pageObjectSlice";
import { predictEndpoints } from "../../utils/generationClassesMap";
import { setBackendAvailable } from "../slices/mainSlice";

export const identifyElements = createAsyncThunk(
    "locators/identifyElements",
    async ({ library, pageObj }, thunkAPI) => {
      thunkAPI.dispatch(setCurrentPageObj(pageObj));

      const endpoint = predictEndpoints[library];
      try {
        const res = await predictElements(endpoint);
        const rounded = res.map((el) => ({
          ...el,
          element_id: `${el.element_id}_${pageObj}`,
          jdnHash: el.element_id,
          predicted_probability: Math.round(el.predicted_probability * 100) / 100,
        }));
        thunkAPI.dispatch(generateLocators({ predictedElements: rounded, library }));
        return thunkAPI.fulfillWithValue(rounded);
      } catch (error) {
        thunkAPI.dispatch(setBackendAvailable(BACKEND_STATUS.ACCESS_FAILED));
        return thunkAPI.rejectWithValue();
      }
    }
);

export const identifyElementsReducer = (builder) => {
  return builder
      .addCase(identifyElements.pending, (state) => {
        state.status = identificationStatus.loading;
        state.allowIdentifyElements = false;
      })
      .addCase(identifyElements.fulfilled, (state, { payload }) => {
        state.status = identificationStatus.success;
      })
      .addCase(identifyElements.rejected, (state, { error }) => {
        state.status = identificationStatus.error;
      });
};
