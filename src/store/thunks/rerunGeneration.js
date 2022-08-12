import { createAsyncThunk } from "@reduxjs/toolkit";
import { locatorsGenerationStatus } from "../../utils/constants";
import { runXpathGeneration } from "./runXpathGeneration";

export const rerunGeneration = createAsyncThunk("locators/rerunGeneration", (generationData, thunkAPI) => {
  return thunkAPI.dispatch(runXpathGeneration(generationData));
});

export const rerunGenerationReducer = (builder) => {
  return builder
      .addCase(rerunGeneration.pending, (state) => {
        state.schedulerStatus = "pending";
        state.generationStatus = locatorsGenerationStatus.started;
      })
      .addCase(rerunGeneration.fulfilled, (state) => {
        state.schedulerStatus = "scheduled";
        state.generationStatus = locatorsGenerationStatus.complete;
      });
};
