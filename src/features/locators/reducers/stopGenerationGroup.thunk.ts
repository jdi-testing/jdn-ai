import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { locatorsAdapter } from '../selectors/locators.selectors';
import { ILocator, LocatorsState, LocatorTaskStatus } from '../types/locator.types';
import { locatorGenerationController } from '../utils/locatorGenerationController';

export const stopGenerationGroup = createAsyncThunk('locators/stopGenerationGroup', async (elements: ILocator[]) => {
  const hashes = elements.map(({ jdnHash }) => jdnHash);
  return locatorGenerationController.revokeTasks(hashes);
});

export const stopGenerationGroupReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(stopGenerationGroup.pending, (state, { meta }) => {
      const newValue = meta.arg.map(({ element_id, locatorValue }) => {
        return {
          element_id,
          locatorValue: { ...locatorValue, xPathStatus: LocatorTaskStatus.REVOKED },
        };
      });
      // @ts-ignore
      locatorsAdapter.upsertMany(state, newValue);
    })
    .addCase(stopGenerationGroup.rejected, (_, { error }) => {
      throw new Error(error.stack);
    });
};
