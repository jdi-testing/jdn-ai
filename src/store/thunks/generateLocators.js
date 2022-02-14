import { createAsyncThunk } from "@reduxjs/toolkit";

import { requestGenerationData } from "../../services/pageDataHandlers";
import { runXpathGeneration } from "./runXpathGeneration";
import { selectLocators } from "../selectors/locatorSelectors";
import { sendMessage } from "../../services/connector";
import { addLocators } from "../locatorsSlice";
import { addLocatorsToPageObj } from "../pageObjectSlice";
import { xPathGenerationStarted } from "../mainSlice";

const filterByProbability = (elements, perception) => {
  return elements.filter((e) => e.predicted_probability >= perception);
};

export const generateLocators = createAsyncThunk("locators/generateLocators", async (predictedElements, thunkAPI) => {
  const availableForGeneration = filterByProbability(predictedElements, 0.5);
  const state = thunkAPI.getState();
  const { perception } = state.main;
  const locators = selectLocators(state);
  if (availableForGeneration.length) {
    const noLocator = availableForGeneration.filter(
        (element) => locators.findIndex((loc) => loc.element_id === element.element_id) === -1
    );
    if (noLocator.length) {
      const { generationData } = await requestGenerationData(noLocator);
      sendMessage.setHighlight({ elements: generationData, perception });
      thunkAPI.dispatch(addLocators(generationData));

      const ids = generationData.map(({element_id}) => element_id);
      thunkAPI.dispatch(addLocatorsToPageObj(ids));

      thunkAPI.dispatch(xPathGenerationStarted());
      thunkAPI.dispatch(runXpathGeneration(generationData));
    }
  }
});

export const generateLocatorsReducer = (builder) => {
  return builder
      .addCase(generateLocators.pending, (state) => {
        state.schedulerStatus = "pending";
      })
      .addCase(generateLocators.fulfilled, (state) => {
        state.schedulerStatus = "scheduled";
      })
      .addCase(generateLocators.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
