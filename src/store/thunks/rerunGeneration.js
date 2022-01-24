import { createAsyncThunk } from "@reduxjs/toolkit";
import { runXpathGeneration } from "./runXpathGeneration";

export const rerunGeneration = createAsyncThunk("main/rerunGeneration", (generationData, thunkAPI) => {
  return thunkAPI.dispatch(runXpathGeneration(generationData));
});
