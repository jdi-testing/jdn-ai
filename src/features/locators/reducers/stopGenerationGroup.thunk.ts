import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { locatorsAdapter } from '../selectors/locators.selectors';
import { ILocator, LocatorsState, LocatorTaskStatus } from '../types/locator.types';
import { locatorGenerationController } from '../utils/LocatorGenerationController';

export const stopGenerationGroup = createAsyncThunk('locators/stopGenerationGroup', async (elements: ILocator[]) => {
  const hashes = elements.map(({ jdnHash }) => jdnHash);
  return locatorGenerationController.revokeTasks(hashes);
});

export const stopGenerationGroupReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(stopGenerationGroup.pending, (state, { meta }) => {
      const newValue = meta.arg.map(({ elementId, locatorValue }) => {
        return {
          elementId,
          locatorValue: {
            ...locatorValue,
            xPathStatus: LocatorTaskStatus.REVOKED,
            cssSelectorStatus: LocatorTaskStatus.REVOKED,
          },
        };
      });
      // @ts-ignore
      locatorsAdapter.upsertMany(state, newValue);
    })
    .addCase(stopGenerationGroup.rejected, (_, { error }) => {
      throw new Error(error.stack);
    });
};
