import { ActionReducerMapBuilder, createAsyncThunk, EntityState } from "@reduxjs/toolkit";
import { locatorsAdapter, simpleSelectLocatorById } from "../../../../features/locators/locators.selectors";
import { runXpathGeneration } from "../../../../features/locators/reducers/runXpathGeneration.thunk";
import { Locator, LocatorsState, LocatorTaskStatus } from "../../../../features/locators/types/locator.types";

export const cancelStopGeneration = createAsyncThunk(
  "locators/cancelStopGeneration",
  async (generationData: Locator[], thunkAPI) => {
    thunkAPI.dispatch(runXpathGeneration({ generationData }));
  }
);

/* eslint-disable */
/* wrong toolkit typings */

export const cancelStopGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState & EntityState<Locator>>) => {
  return builder
      .addCase(cancelStopGeneration.pending, (state, { meta }) => {
        const { arg } = meta;
        arg.forEach(({ element_id }) => {
          const existingLocator = simpleSelectLocatorById(state, element_id);
          existingLocator &&
          // @ts-ignore
            locatorsAdapter.upsertOne(state, {
            element_id,
            locator: { ...existingLocator.locator, taskStatus: LocatorTaskStatus.PENDING },
          });
        });
      })
      .addCase(cancelStopGeneration.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
