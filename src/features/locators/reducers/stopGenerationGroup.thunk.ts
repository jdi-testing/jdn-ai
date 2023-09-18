import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { locatorsAdapter } from "../selectors/locators.selectors";
import { ILocator, LocatorsState } from "../types/locator.types";
import { locatorGenerationController } from "../utils/locatorGenerationController";
import { LocatorTaskStatus } from "../types/locator.types";

export const stopGenerationGroup = createAsyncThunk("locators/stopGenerationGroup", async (elements: ILocator[]) => {
  const hashes = elements.map(({ jdnHash }) => jdnHash);
  return locatorGenerationController.revokeTasks(hashes);
});

export const stopGenerationGroupReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(stopGenerationGroup.pending, (state, { meta }) => {
      const newValue = meta.arg.map(({ element_id, locator }) => {
        return {
          element_id,
          locator: { ...locator, xPathStatus: LocatorTaskStatus.REVOKED },
        };
      });
      // @ts-ignore
      locatorsAdapter.upsertMany(state, newValue);
    })
    .addCase(stopGenerationGroup.rejected, (_, { error }) => {
      throw new Error(error.stack);
    });
};
