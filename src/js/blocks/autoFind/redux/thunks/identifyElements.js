import { createAsyncThunk } from "@reduxjs/toolkit";
import { autoFindStatus } from "../../autoFindProvider/AutoFindProvider";
import { getElements } from "../../utils/pageDataHandlers";
import { generateLocators } from "./generateLocators";

export const identifyElements = createAsyncThunk("main/identifyElements", async (data, thunkAPI) => {
  const res = await getElements();
  const rounded = res.map((el) => ({
    ...el,
    predicted_probability: Math.round(el.predicted_probability * 100) / 100,
  }));
  thunkAPI.dispatch(generateLocators(rounded));
  return thunkAPI.fulfillWithValue(rounded);
});

export const identifyElementsReducer = (builder) => {
  return builder
      .addCase(identifyElements.pending, (state, action) => {
        state.status = autoFindStatus.loading;
        state.allowIdentifyElements = false;
      })
      .addCase(identifyElements.fulfilled, (state, { payload }) => {
        state.status = autoFindStatus.success;
        state.allowRemoveElements = true;
        state.predictedElements = payload;
      })
      .addCase(identifyElements.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
