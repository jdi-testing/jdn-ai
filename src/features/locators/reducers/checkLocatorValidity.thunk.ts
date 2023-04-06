import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store/store";
import { selectLocatorsByPageObject } from "../../pageObjects/pageObject.selectors";
import { locatorsAdapter } from "../locators.selectors";
import { changeLocatorAttributes } from "../locators.slice";
import { Locator, LocatorsState } from "../types/locator.types";
import { getPrioritizedXpathes } from "../utils/locatorOutput";
import { validateXpath } from "../utils/locatorValidation";

export const checkLocatorsValidity = createAsyncThunk(
  "locators/checkLocatorsValidity",
  async (payload, thunkAPI) => {
    const state = thunkAPI.getState();

    const locators = selectLocatorsByPageObject(state as RootState);

    const invalidLocators: Partial<Locator>[] = [];

    for (const locator of locators) {
        const { jdnHash, element_id, locator: locatorValue } = locator;
        const validation = await validateXpath(getPrioritizedXpathes(locatorValue)[0], jdnHash, locators);
        if (validation.length) invalidLocators.push({ element_id, validity: { locator: validation }, jdnHash });
    }

    return { invalidLocators };
  }
);

export const checkLocatorsValidityReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
    return builder.addCase(checkLocatorsValidity.fulfilled, (state, { payload }) => {
        const { invalidLocators } = payload;
        // @ts-ignore
        locatorsAdapter.upsertMany(state, invalidLocators);
    })
}
