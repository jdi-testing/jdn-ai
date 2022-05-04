import { createAsyncThunk } from "@reduxjs/toolkit";

import { runGenerationHandler } from "../../services/locatorGenerationController";
import { updateLocator } from "../slices/locatorsSlice";

export const runXpathGeneration = createAsyncThunk("locators/scheduleGeneration", async (generationData, thunkAPI) => {
  const state = thunkAPI.getState();
  const { xpathConfig } = state.main;
  await runGenerationHandler(generationData, xpathConfig, (el) => {
    thunkAPI.dispatch(updateLocator(el));
  },
  );
  return generationData;
});
