import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "../../../app/store/store";
import { LocatorsState, PredictedEntity } from "../types/locator.types";
import { addLocators } from "../locators.slice";
import { addLocatorsToPageObj } from "../../pageObjects/pageObject.slice";
import { ElementLibrary } from "../types/generationClasses.types";
import { selectAutoGeneratingLocatorTypes } from "../../pageObjects/selectors/pageObjects.selectors";
import { createLocatorAttributes } from "../utils/createLocatorAttributes";

interface Meta {
  predictedElements: PredictedEntity[];
  library: ElementLibrary;
}

export const createLocators = createAsyncThunk("locators/createLocators", async (payload: Meta, thunkAPI) => {
  const { predictedElements, library } = payload;
  const state = thunkAPI.getState();
  const isAutogenerating = selectAutoGeneratingLocatorTypes(state as RootState);
  const isAutogeneratingAll = Object.values(isAutogenerating).every((value) => value);

  if (predictedElements.length) {
    const locators = await createLocatorAttributes(predictedElements, library, isAutogeneratingAll);
    thunkAPI.dispatch(addLocators(locators));

    const ids = locators.map(({ element_id }) => element_id);
    thunkAPI.dispatch(addLocatorsToPageObj(ids));
  }
});

export const createLocatorsReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder.addCase(createLocators.rejected, (state, { error }) => {
    throw new Error(error.stack);
  });
};
