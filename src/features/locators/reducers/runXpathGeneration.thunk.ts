import { createAsyncThunk } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { RootState } from "../../../app/store/store";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { selectPageObjById, selectLocatorByJdnHash } from "../../pageObjects/pageObject.selectors";
import { updateLocator, failGeneration } from "../locators.slice";
import { Locator } from "../types/locator.types";
import { runGenerationHandler } from "../utils/locatorGenerationController";

interface Meta {
  generationData: Locator[];
  maxGenerationTime?: MaxGenerationTime;
}

export const runXpathGeneration = createAsyncThunk("locators/scheduleGeneration", async (meta: Meta, thunkAPI) => {
  const { generationData, maxGenerationTime } = meta;
  const state = thunkAPI.getState() as RootState;
  const { xpathConfig } = state.main;
  const pageObject =
    !isNil(state.pageObject.present.currentPageObject) &&
    selectPageObjById(state, state.pageObject.present.currentPageObject);
  await runGenerationHandler(
    generationData,
    { ...xpathConfig, maximum_generation_time: maxGenerationTime || xpathConfig.maximum_generation_time },
    (el: Locator) => {
      const { element_id, jdnHash } = el;
      let foundId;
      if (!element_id) {
        foundId = selectLocatorByJdnHash(state, jdnHash)?.element_id;
      }
      thunkAPI.dispatch(updateLocator({ ...el, element_id: element_id || foundId }));
    },
    (ids: string[]) => thunkAPI.dispatch(failGeneration(ids)),
    pageObject
  );
  return generationData;
});
