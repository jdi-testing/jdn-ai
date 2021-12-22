import { createAsyncThunk } from "@reduxjs/toolkit";
import { sendMessage } from "../../utils/connector";
import { requestGenerationData } from "../../utils/pageDataHandlers";
import { xPathGenerationStarted } from "../predictionSlice";
import { selectLocators } from "../selectors";
import { runXpathGeneration } from "./runXpathGeneration";

const filterByProbability = (elements, perception) => {
  return elements.filter((e) => e.predicted_probability >= perception);
};

export const generateLocators = createAsyncThunk("main/generateLocators", async (predictedElements, thunkAPI) => {
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
