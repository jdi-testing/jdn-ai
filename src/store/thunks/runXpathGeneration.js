import { createAsyncThunk } from "@reduxjs/toolkit";

import { runGenerationHandler } from "../../services/locatorGenerationController";
import { selectLocatorByJdnHash, selectPageObjById } from "../selectors/pageObjectSelectors";
import { failGeneration, updateLocator } from "../slices/locatorsSlice";

export const runXpathGeneration = createAsyncThunk("locators/scheduleGeneration", async (generationData, thunkAPI) => {
  const state = thunkAPI.getState();
  const { xpathConfig } = state.main;
  const pageObject = selectPageObjById(state, state.pageObject.currentPageObject);
  await runGenerationHandler(
      generationData,
      xpathConfig,
      (el) => {
        const {element_id, jdnHash} = el;
        let foundId;
        if (!element_id) {
          foundId = selectLocatorByJdnHash(state, jdnHash).element_id;
        }
        thunkAPI.dispatch(updateLocator({...el, element_id: element_id || foundId}));
      },
      (ids) => thunkAPI.dispatch(failGeneration(ids)),
      pageObject,
  );
  return generationData;
});
