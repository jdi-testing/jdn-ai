import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store/store";
import { selectLocatorsByPageObject } from "../../pageObjects/pageObject.selectors";
import { locatorsAdapter } from "../locators.selectors";
import { Locator, LocatorsState, LocatorValidationErrorType } from "../types/locator.types";
import { getLocator } from "../utils/locatorOutput";
import { validateLocator } from "../utils/locatorValidation";

export const checkLocatorsValidity = createAsyncThunk("locators/checkLocatorsValidity", async (payload, thunkAPI) => {
  const state = thunkAPI.getState();

  const locators = selectLocatorsByPageObject(state as RootState);

  const invalidLocators: Partial<Locator>[] = [];

  for (const locator of locators) {
    const { jdnHash, element_id, locator: locatorValue, locatorType } = locator;
    try {
      const validation = await validateLocator(getLocator(locatorValue, locatorType), jdnHash, locators, element_id);
      if (validation.length)
        invalidLocators.push({ element_id, message: validation as LocatorValidationErrorType, jdnHash });
    } catch (error) {
      invalidLocators.push({ element_id, message: error.message as LocatorValidationErrorType, jdnHash });
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
