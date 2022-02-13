import { createAsyncThunk } from "@reduxjs/toolkit";

import { locatorsAdapter, simpleSelectLocatorById } from "../selectors";
import { stopGenerationHandler } from "../../services/locatorGenerationController";
import { locatorTaskStatus } from "../../utils/constants";

export const stopGeneration = createAsyncThunk("locators/stopGeneration", async (element_id) => {
  return stopGenerationHandler([element_id]);
});

export const stopGenerationReducer = (builder) => {
  return builder.addCase(stopGeneration.pending, (state, { meta }) => {
    state.showBackdrop = true;
    const element_id = meta.arg;
    const existingLocator = simpleSelectLocatorById(state, element_id);
    locatorsAdapter.upsertOne(state, {
      element_id,
      locator: { ...existingLocator.locator, taskStatus: locatorTaskStatus.REVOKED },
    });
  })
      .addCase(stopGeneration.fulfilled, (state, { meta }) => {
        state.showBackdrop = false;
      })
      .addCase(stopGeneration.rejected, (state, { error }) => {
        state.showBackdrop = false;
        throw new Error(error.stack);
      });
};
