import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { Locator, LocatorsGenerationStatus, LocatorsState } from "../slices/locatorSlice.types";
import { runXpathGeneration } from "./runXpathGeneration";

export const rerunGeneration = createAsyncThunk("locators/rerunGeneration", (generationData: Locator[], thunkAPI) => {
  return thunkAPI.dispatch(runXpathGeneration(generationData));
});

export const rerunGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
      .addCase(rerunGeneration.pending, (state) => {
        state.generationStatus = LocatorsGenerationStatus.started;
      })
      .addCase(rerunGeneration.fulfilled, (state) => {
        state.generationStatus = LocatorsGenerationStatus.complete;
      });
};
