import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { locatorTaskStatus } from "../../../common/constants/constants";
import { locatorsAdapter } from "../locators.selectors";
import { Locator, LocatorsState } from "../types/locator.types";
import { stopGenerationHandler } from "../utils/locatorGenerationController";

export const stopGenerationGroup = createAsyncThunk("locators/stopGenerationGroup", async (elements: Locator[]) => {
  const hashes = elements.map(({ jdnHash }) => jdnHash);
  return stopGenerationHandler(hashes);
});

export const stopGenerationGroupReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(stopGenerationGroup.pending, (state, { meta }) => {
      const newValue = meta.arg.map(({ element_id, locator }) => {
        return {
          element_id,
          locator: { ...locator, taskStatus: locatorTaskStatus.REVOKED },
        };
      });
      // @ts-ignore
      locatorsAdapter.upsertMany(state, newValue);
    })
    .addCase(stopGenerationGroup.rejected, (_, { error }) => {
      throw new Error(error.stack);
    });
};
