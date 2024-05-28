import { type ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { locatorsAdapter } from '../selectors/locators.selectors';
import { ILocator, LocatorsState, LocatorValidationErrorType } from '../types/locator.types';
import { validateLocator } from '../utils/locatorValidation';
import { LocatorType } from '../../../common/types/common';
import { selectLocatorsByPageObject } from '../selectors/locatorsByPO.selectors';
import { useSelector } from 'react-redux';
import { selectNotShownElementIds } from '../../../services/pageDocument/pageDocument.selectors';

export const checkLocatorsValidity = createAsyncThunk('locators/checkLocatorsValidity', async (payload, thunkAPI) => {
  const state = thunkAPI.getState();

  const locators: ILocator[] = selectLocatorsByPageObject(state as RootState);

  const invalidLocators: Partial<ILocator>[] = [];
  const notShownElementIds = useSelector(selectNotShownElementIds);

  for (const locator of locators) {
    const { jdnHash, elementId, locatorValue, locatorType } = locator;
    try {
      const validation = await validateLocator(
        locatorValue.output ?? '',
        locatorType || LocatorType.xPath,
        jdnHash,
        locators,
        elementId,
        notShownElementIds,
      );
      if (validation.length)
        invalidLocators.push({ elementId, message: validation as LocatorValidationErrorType, jdnHash });
    } catch (error) {
      invalidLocators.push({ elementId, message: error.message as LocatorValidationErrorType, jdnHash });
    }
  }

  return { invalidLocators };
});

export const checkLocatorsValidityReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder.addCase(checkLocatorsValidity.fulfilled, (state, { payload }) => {
    const { invalidLocators } = payload;
    // @ts-ignore
    locatorsAdapter.upsertMany(state, invalidLocators);
  });
};
