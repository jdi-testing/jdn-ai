import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { locatorsAdapter } from "../../../../features/locators/locators.selectors";
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

export const cancelStopGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
      .addCase(cancelStopGeneration.pending, (state, { meta }) => {
        const { arg } = meta;
        arg.forEach(({ element_id }) => {
          // @ts-ignore
          const existingLocator = simpleSelectLocatorById(state, element_id);
          // @ts-ignore
          existingLocator && locatorsAdapter.upsertOne(state, {
            element_id,
            locator: { ...existingLocator.locator, taskStatus: LocatorTaskStatus.PENDING },
          });
        });
      })
      .addCase(cancelStopGeneration.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
