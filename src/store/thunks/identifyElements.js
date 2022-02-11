import { createAsyncThunk } from "@reduxjs/toolkit";

import { identificationStatus } from "../../utils/constants";
import { generateLocators } from "./generateLocators";
import { getElements } from "../../services/pageDataHandlers";
import { setCurrentPageObj } from "../pageObjectSlice";

export const identifyElements = createAsyncThunk("main/identifyElements", async ({endpoint, pageObj}, thunkAPI) => {
  thunkAPI.dispatch(setCurrentPageObj(pageObj));

  const res = await getElements(endpoint);
  const rounded = res.map((el) => ({
    ...el,
    element_id: `${el.element_id}_${pageObj}`,
    jdnHash: el.element_id,
    predicted_probability: Math.round(el.predicted_probability * 100) / 100,
  }));
  thunkAPI.dispatch(generateLocators(rounded));
  return thunkAPI.fulfillWithValue(rounded);
});

export const identifyElementsReducer = (builder) => {
  return builder
      .addCase(identifyElements.pending, (state) => {
        state.status = identificationStatus.loading;
        state.allowIdentifyElements = false;
      })
      .addCase(identifyElements.fulfilled, (state, { payload }) => {
        state.status = identificationStatus.success;
        state.allowRemoveElements = true;
        state.predictedElements = payload;
      })
      .addCase(identifyElements.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
