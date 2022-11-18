import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { MaxGenerationTime } from "../../app/mainSlice.types";
import { Locator, LocatorsGenerationStatus, LocatorsState } from "../../features/locators/locatorSlice.types";
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
