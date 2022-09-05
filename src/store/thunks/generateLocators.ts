import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";

import { runXpathGeneration } from "./runXpathGeneration";
import { selectLocators } from "../selectors/locatorSelectors";
import { addLocators } from "../slices/locatorsSlice";
import { addLocatorsToPageObj } from "../slices/pageObjectSlice";
import { convertToListWithChildren } from "../../utils/helpers";
import { requestGenerationData, setParents } from "../../services/pageDataHandlers";
import { Locator, LocatorsGenerationStatus, LocatorsState, LocatorTaskStatus, PredictedEntity } from "../slices/locatorSlice.types";
import { ElementLibrary } from "../../components/PageObjects/utils/generationClassesMap";
import { RootState } from "../store";

interface Meta {
  predictedElements: PredictedEntity[],
  library: ElementLibrary,
}

const filterByProbability = (elements: PredictedEntity[], perception: number) => {
  return elements.filter((e) => e.predicted_probability >= perception);
};

export const generateLocators = createAsyncThunk("locators/generateLocators", async (payload: Meta, thunkAPI) => {
  const { predictedElements, library } = payload;
  const availableForGeneration = filterByProbability(predictedElements, 0.5);
  const state = thunkAPI.getState();
  const locators = selectLocators(state as RootState);
  if (availableForGeneration.length) {
    const noLocator = availableForGeneration.filter(
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
  return builder
    .addCase(generateLocators.pending, (state) => {
      state.generationStatus = LocatorsGenerationStatus.started;
    })
    .addCase(generateLocators.fulfilled, (state) => {
      state.generationStatus = LocatorsGenerationStatus.complete;
    })
    .addCase(generateLocators.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
