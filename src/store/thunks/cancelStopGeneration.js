import { createAsyncThunk } from "@reduxjs/toolkit";
import { locatorsAdapter } from "../selectors";
import { runXpathGeneration } from "./runXpathGeneration";

export const cancelStopGeneration = createAsyncThunk(
    "locators/cancelStopGeneration",
    async (generationData, thunkAPI) => {
      thunkAPI.dispatch(runXpathGeneration(generationData));
    }
);

export const cancelStopGenerationReducer = (builder) => {
  return builder.addCase(cancelStopGeneration.pending, (state, { meta }) => {
    const { arg } = meta;
    arg.forEach(({ element_id }) => {
      const existingLocator = simpleSelectLocatorById(state, element_id);
      locatorsAdapter.upsertOne(state, {
        element_id,
        locator: { ...existingLocator.locator, taskStatus: locatorTaskStatus.PENDING },
      });
    });
  });
};
