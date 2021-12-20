import { createAsyncThunk } from "@reduxjs/toolkit";
import { locatorTaskStatus, stopGenerationHandler } from "../../utils/locatorGenerationController";
import { locatorsAdapter, simpleSelectLocatorById } from "../selectors";

export const stopGeneration = createAsyncThunk("main/stopGeneration", async (element_id) => {
  return stopGenerationHandler(element_id);
});

export const stopGenerationReducer = (builder) => {
  return builder.addCase(stopGeneration.pending, (state, { meta }) => {
    state.showBackdrop = true;
    const element_id = meta.arg;
    locatorsAdapter.upsertOne(state, { element_id, stopped: true });
  })
      .addCase(stopGeneration.fulfilled, (state, { meta }) => {
        state.showBackdrop = false;
        const element = simpleSelectLocatorById(state, meta.arg);
        const { element_id, locator } = element;
        locatorsAdapter.upsertOne(state, {
          element_id,
          locator: { ...locator, taskStatus: locatorTaskStatus.REVOKED },
        });
      })
      .addCase(stopGeneration.rejected, (state, { error }) => {
        state.showBackdrop = false;
        throw new Error(error.stack);
      });
};
