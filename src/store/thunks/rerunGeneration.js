import { createAsyncThunk } from "@reduxjs/toolkit";
import { locatorsAdapter } from "../selectors";
import { runXpathGeneration } from "./runXpathGeneration";

export const rerunGeneration = createAsyncThunk("main/rerunGeneration", async (generationData, thunkAPI) => {
  thunkAPI.dispatch(runXpathGeneration(generationData));
});

export const rerunGenerationReducer = (builder) => {
  return builder.addCase(rerunGeneration.pending, (state, { meta }) => {
    const { arg } = meta;
    arg.forEach(({ element_id }) => {
      locatorsAdapter.upsertOne(state, { element_id, stopped: false });
    });
  });
};
