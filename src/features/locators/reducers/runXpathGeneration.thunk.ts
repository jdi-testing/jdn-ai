import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { RootState } from "../../../app/store/store";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { selectPageObjById, selectLocatorByJdnHash } from "../../pageObjects/pageObject.selectors";
import { updateLocator, failGeneration } from "../locators.slice";
import { IdentificationStatus, Locator, LocatorsGenerationStatus, LocatorsState } from "../types/locator.types";
import { runGenerationHandler } from "../utils/locatorGenerationController";
import { NO_ELEMENT_IN_DOCUMENT } from "../utils/constants";
import { sendMessage } from "../../../pageServices/connector";
import { selectLocatorById } from "../locators.selectors";

interface Meta {
  generationData: Locator[];
  maxGenerationTime?: MaxGenerationTime;
}

export const runXpathGeneration = createAsyncThunk("locators/scheduleGeneration", async (meta: Meta, thunkAPI) => {
  const { generationData, maxGenerationTime } = meta;
  const state = thunkAPI.getState() as RootState;
  const { xpathConfig } = state.main;
  const reScheduledTasks = new Set();

  const pageObject =
    !isNil(state.pageObject.present.currentPageObject) &&
    selectPageObjById(state, state.pageObject.present.currentPageObject);

  const failHandler = async (ids: string[], errorMessage: string) => {
    if (ids.length === 1 && errorMessage === NO_ELEMENT_IN_DOCUMENT) {
      const id = ids[0];
      if (reScheduledTasks.has(id)) {
        reScheduledTasks.delete(id);
        thunkAPI.dispatch(failGeneration(ids));
      } else {
        reScheduledTasks.add(id);
        const element = selectLocatorById(state, id)!;
        await sendMessage.assignJdnHash({ jdnHash: element.jdnHash, locator: element.locator.xPath });
        await runGenerationHandler([element]);
      }
    } else thunkAPI.dispatch(failGeneration(ids));
  };

  await runGenerationHandler(
    generationData,
    {
      ...xpathConfig,
      maximum_generation_time: maxGenerationTime || xpathConfig.maximum_generation_time,
      ...(maxGenerationTime ? { advanced_calculation: true } : null),
    },
    (el: Locator) => {
      const { element_id, jdnHash } = el;
      let foundId;
      if (!element_id) {
        foundId = selectLocatorByJdnHash(state, jdnHash)?.element_id;
      }
      thunkAPI.dispatch(updateLocator({ ...el, element_id: element_id || foundId }));
    },
    failHandler,
    pageObject
  );
  return generationData;
});

export const runXpathGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(runXpathGeneration.pending, (state) => {
      state.generationStatus = LocatorsGenerationStatus.starting;
    })
    .addCase(runXpathGeneration.fulfilled, (state) => {
      state.status = IdentificationStatus.noStatus;
      state.generationStatus = LocatorsGenerationStatus.started;
    });
};
