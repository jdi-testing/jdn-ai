import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { locatorsAdapter, simpleSelectLocatorById } from "../../../../features/locators/locators.selectors";
import { Locator, LocatorsState, LocatorTaskStatus } from "../../../../features/locators/types/locator.types";
import { stopGenerationHandler } from "../../../../features/locators/utils/locatorGenerationController";

export const cancelRerun = createAsyncThunk(
  "locators/cancelRerun",
  async ({ generationData }: { generationData: Locator[] }) => {
    const hashes = generationData.map(({ jdnHash }) => jdnHash);
    stopGenerationHandler(hashes);
  }
);

export const cancelRerunReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(cancelRerun.pending, (state: LocatorsState, { meta }) => {
      const { arg } = meta;
      arg.generationData.forEach(({ element_id }) => {
        // @ts-ignore
        const existingLocator = simpleSelectLocatorById(state, element_id);
        // @ts-ignore
        existingLocator &&
          // @ts-ignore
          locatorsAdapter.upsertOne(state, {
            element_id,
            locator: { ...existingLocator.locator, taskStatus: LocatorTaskStatus.FAILURE },
          });
      });
    })
    .addCase(cancelRerun.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
