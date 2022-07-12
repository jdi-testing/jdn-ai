import { createAsyncThunk } from "@reduxjs/toolkit";

import { runXpathGeneration } from "./runXpathGeneration";
import { selectLocators } from "../selectors/locatorSelectors";
import { addLocators } from "../slices/locatorsSlice";
import { addLocatorsToPageObj } from "../slices/pageObjectSlice";
import { convertToListWithChildren } from "../../utils/helpers";
import { requestGenerationData, setParents } from "../../services/pageDataHandlers";
import { locatorsGenerationStatus, locatorTaskStatus } from "../../utils/constants";

const filterByProbability = (elements, perception) => {
  return elements.filter((e) => e.predicted_probability >= perception);
};

export const generateLocators = createAsyncThunk("locators/generateLocators", async (payload, thunkAPI) => {
  const { predictedElements, library } = payload;
  const availableForGeneration = filterByProbability(predictedElements, 0.5);
  const state = thunkAPI.getState();
  const locators = selectLocators(state);
  if (availableForGeneration.length) {
    const noLocator = availableForGeneration.filter(
        (element) => locators.findIndex((loc) => loc.element_id === element.element_id) === -1
    );
    if (noLocator.length) {
      const { generationData } = await requestGenerationData(noLocator, library);
      const _locatorsWithParents = await setParents(generationData);
      const locatorsWithParents = convertToListWithChildren(_locatorsWithParents);
      const pendingLocators = locatorsWithParents.map((locator) => ({
        ...locator,
        locator: { ...locator.locator, taskStatus: locatorTaskStatus.PENDING },
      }));
      thunkAPI.dispatch(addLocators(pendingLocators));

      const ids = locatorsWithParents.map(({ element_id }) => element_id);
      thunkAPI.dispatch(addLocatorsToPageObj(ids));

      thunkAPI.dispatch(runXpathGeneration(pendingLocators));
    }
  }
});

export const generateLocatorsReducer = (builder) => {
  return builder
      .addCase(generateLocators.pending, (state) => {
        state.schedulerStatus = "pending";
        state.generationStatus = locatorsGenerationStatus.started;
      })
      .addCase(generateLocators.fulfilled, (state) => {
        state.schedulerStatus = "scheduled";
        state.generationStatus = locatorsGenerationStatus.complete;
      })
      .addCase(generateLocators.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
