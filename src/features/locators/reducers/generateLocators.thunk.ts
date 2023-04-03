import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "../../../app/store/store";
import { requestGenerationData, setParents } from "../../../pageServices/pageDataHandlers";
import { selectLocators } from "../locators.selectors";
import { Locator, LocatorsState, LocatorTaskStatus, PredictedEntity } from "../types/locator.types";
import { addLocators } from "../locators.slice";
import { addLocatorsToPageObj } from "../../pageObjects/pageObject.slice";
import { ElementLibrary } from "../types/generationClasses.types";
import { runXpathGeneration } from "./runXpathGeneration.thunk";
import { convertToListWithChildren } from "../utils/locatorsTreeUtils";

interface Meta {
  predictedElements: PredictedEntity[];
  library: ElementLibrary;
}

export const generateLocators = createAsyncThunk("locators/generateLocators", async (payload: Meta, thunkAPI) => {
  const { predictedElements, library } = payload;
  const state = thunkAPI.getState();
  const locators = selectLocators(state as RootState);
  if (predictedElements.length) {
    const noLocator = predictedElements.filter(
      (element) => locators.findIndex((loc) => loc.element_id === element.element_id) === -1
    );
    if (noLocator.length) {
      const { generationData } = await requestGenerationData(noLocator, library);
      const _locatorsWithParents = await setParents(generationData);
      const locatorsWithParents: Locator[] = convertToListWithChildren(_locatorsWithParents);
      const pendingLocators = locatorsWithParents.map((locator) => ({
        ...locator,
        locator: { ...locator.locator, taskStatus: LocatorTaskStatus.PENDING },
      }));
      thunkAPI.dispatch(addLocators(pendingLocators));

      const ids = locatorsWithParents.map(({ element_id }) => element_id);
      thunkAPI.dispatch(addLocatorsToPageObj(ids));

      thunkAPI.dispatch(runXpathGeneration({ generationData: pendingLocators }));
    }
  }
});

export const generateLocatorsReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder.addCase(generateLocators.rejected, (state, { error }) => {
    throw new Error(error.stack);
  });
};
