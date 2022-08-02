import { createAsyncThunk } from "@reduxjs/toolkit";

import { runGenerationHandler } from "../../services/locatorGenerationController";
import { selectPageObjById } from "../selectors/pageObjectSelectors";
import { failGeneration, updateLocator } from "../slices/locatorsSlice";

export const runXpathGeneration = createAsyncThunk("locators/scheduleGeneration", async (generationData, thunkAPI) => {
  const state = thunkAPI.getState();
  const { xpathConfig } = state.main;
  const pageObject = selectPageObjById(state, state.pageObject.currentPageObject);
  await runGenerationHandler(
      generationData,
      xpathConfig,
      (el) => {
        thunkAPI.dispatch(updateLocator(el));
      },
      (ids) => thunkAPI.dispatch(failGeneration(ids)),
      pageObject,
  );
  return generationData;
});
