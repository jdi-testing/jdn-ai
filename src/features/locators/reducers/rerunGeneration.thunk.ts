import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { Locator, LocatorsState, LocatorsGenerationStatus } from "../../../features/locators/types/locator.types";
import { runXpathGeneration } from "./runXpathGeneration.thunk";

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
