import { createAsyncThunk } from "@reduxjs/toolkit";

import { locatorsAdapter } from "../selectors/locatorSelectors";
import { locatorTaskStatus } from "../../utils/constants";
import { stopGenerationHandler } from "../../services/locatorGenerationController";

export const stopGenerationGroup = createAsyncThunk("locators/stopGenerationGroup", async (elements) => {
  const hashes = elements.map(({jdnHash}) => jdnHash);
  return stopGenerationHandler(hashes);
});

export const stopGenerationGroupReducer = (builder) => {
  return builder.addCase(stopGenerationGroup.pending, (state, { meta }) => {
    state.showBackdrop = true;
    const newValue = meta.arg.map(({ element_id, locator }) => {
      return {
        element_id,
        locator: { ...locator, taskStatus: locatorTaskStatus.REVOKED },
      };
    });
    locatorsAdapter.upsertMany(state, newValue);
  })
      .addCase(stopGenerationGroup.fulfilled, (state) => {
        state.showBackdrop = false;
      })
      .addCase(stopGenerationGroup.rejected, (state, { error }) => {
        state.showBackdrop = false;
        throw new Error(error.stack);
      });
};
