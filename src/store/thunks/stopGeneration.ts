import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";

import { locatorsAdapter, selectLocatorById, simpleSelectLocatorById } from "../selectors/locatorSelectors";
import { stopGenerationHandler } from "../../services/locatorGenerationController";
import { locatorTaskStatus } from "../../utils/constants";
import { ElementId, LocatorsState } from "../slices/locatorSlice.types";
import { RootState } from "../store";

export const stopGeneration = createAsyncThunk("locators/stopGeneration", async (element_id: ElementId, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const jdnHash = selectLocatorById(state, element_id)?.jdnHash;
  return stopGenerationHandler([jdnHash]);
});

/* eslint-disable */
/* wrong toolkit typings */

export const stopGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder.addCase(stopGeneration.pending, (state, { meta }) => {
    const element_id = meta.arg;
    // @ts-ignore
    const existingLocator = simpleSelectLocatorById(state, element_id);
    // @ts-ignore
    locatorsAdapter.upsertOne(state, {
      element_id,
      // @ts-ignore
      locator: { ...existingLocator.locator, taskStatus: locatorTaskStatus.REVOKED },
    });
  })
      .addCase(stopGeneration.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
