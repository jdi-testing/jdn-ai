import { createAsyncThunk } from "@reduxjs/toolkit";

import { runGenerationHandler } from "../../services/locatorGenerationController";
import { updateLocator } from "../predictionSlice";
import { selectFirstPendingLocator } from "../selectors";

export const runXpathGeneration = createAsyncThunk("main/scheduleGeneration", async (generationData, thunkAPI) => {
  const state = thunkAPI.getState();
  const { xpathConfig } = state.main;
  await runGenerationHandler(generationData, xpathConfig, (el) => {
    thunkAPI.dispatch(updateLocator(el));
  },
  () => selectFirstPendingLocator(thunkAPI.getState()),
  );
  return generationData;
});
