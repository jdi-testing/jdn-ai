import { ActionReducerMapBuilder, createAsyncThunk, EntityState } from "@reduxjs/toolkit";
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

export const cancelRerunReducer = (builder: ActionReducerMapBuilder<LocatorsState & EntityState<Locator>>) => {
  return builder
    .addCase(cancelRerun.pending, (state, { meta }) => {
      const { arg } = meta;
      arg.generationData.forEach(({ element_id }) => {
        const existingLocator = simpleSelectLocatorById(state, element_id);
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
