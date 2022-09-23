import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { Locator, LocatorsGenerationStatus, LocatorsState } from "../slices/locatorSlice.types";
import { MaxGenerationTime } from "../slices/mainSlice.types";
import { runXpathGeneration } from "./runXpathGeneration";

interface Meta {
  generationData: Locator[];
  maxGenerationTime?: MaxGenerationTime;
}

export const rerunGeneration = createAsyncThunk("locators/rerunGeneration", (meta: Meta, thunkAPI) => {
  return thunkAPI.dispatch(runXpathGeneration(meta));
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
