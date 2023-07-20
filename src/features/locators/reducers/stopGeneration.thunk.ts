import { ActionReducerMapBuilder, createAsyncThunk, EntityState } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store/store";
import { locatorsAdapter, selectLocatorById, simpleSelectLocatorById } from "../selectors/locators.selectors";
import { ElementId, Locator, LocatorsState, LocatorTaskStatus } from "../types/locator.types";
import { locatorGenerationController } from "../utils/locatorGenerationController";

export const stopGeneration = createAsyncThunk("locators/stopGeneration", async (element_id: ElementId, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const jdnHash = selectLocatorById(state, element_id)?.jdnHash;
  if (!jdnHash) return;
  return locatorGenerationController.revokeTasks([jdnHash]);
});

/* eslint-disable */
/* wrong toolkit typings */

export const stopGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState & EntityState<Locator>>) => {
  return builder.addCase(stopGeneration.pending, (state, { meta }) => {
    const id = meta.arg;
    const existingLocator = simpleSelectLocatorById(state, id);
    if (!existingLocator) return;
    // @ts-ignore
    locatorsAdapter.upsertOne(state, {
      element_id: id,
      locator: { ...existingLocator.locator, xPathStatus: LocatorTaskStatus.REVOKED },
    });
  })
    .addCase(stopGeneration.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
