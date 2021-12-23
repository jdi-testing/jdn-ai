import { createAsyncThunk } from "@reduxjs/toolkit";

import { runGenerationHandler } from "../../services/locatorGenerationController";
import { updateLocator } from "../predictionSlice";

export const runXpathGeneration = createAsyncThunk("main/scheduleGeneration", async (generationData, thunkAPI) => {
  const { xpathConfig } = thunkAPI.getState().main;
  await runGenerationHandler(generationData, xpathConfig, (el) => {
    thunkAPI.dispatch(updateLocator(el));
  });
  return generationData;
});
