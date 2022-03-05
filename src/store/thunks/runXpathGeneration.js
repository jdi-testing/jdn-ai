import { createAsyncThunk } from "@reduxjs/toolkit";

import { runGenerationHandler } from "../../services/locatorGenerationController";
import { updateLocator } from "../slices/locatorsSlice";
import { selectPendingLocatorsByPageObj } from "../selectors/pageObjectSelectors";

export const runXpathGeneration = createAsyncThunk("locators/scheduleGeneration", async (generationData, thunkAPI) => {
  const state = thunkAPI.getState();
  const { xpathConfig } = state.main;
  await runGenerationHandler(generationData, xpathConfig, (el) => {
    thunkAPI.dispatch(updateLocator(el));
  },
  () => selectPendingLocatorsByPageObj(thunkAPI.getState()),
  );
  return generationData;
});
