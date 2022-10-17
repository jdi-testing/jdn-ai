import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { locatorTaskStatus } from "../../utils/constants";
import { locatorsAdapter, simpleSelectLocatorById } from "../selectors/locatorSelectors";
import { Locator, LocatorsState } from "../slices/locatorSlice.types";
import { runXpathGeneration } from "./runXpathGeneration";

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
            locator: { ...existingLocator.locator, taskStatus: locatorTaskStatus.PENDING },
          });
        });
      })
      .addCase(cancelStopGeneration.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};