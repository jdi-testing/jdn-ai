import { createAsyncThunk } from "@reduxjs/toolkit";
import { getElements, highlightElements, requestGenerationData, runGenerationHandler } from "../utils/pageDataHandlers";
import { updateLocator, xPathGenerationStarted } from "./predictionSlice";

export const identifyElements = createAsyncThunk("main/identifyElements", async (data, thunkAPI) => {
  const res = await getElements();
  const rounded = res.map((el) => ({
    ...el,
    predicted_probability: Math.round(el.predicted_probability * 100) / 100,
  }));
  thunkAPI.dispatch(generateLocators(rounded));
  return thunkAPI.fulfillWithValue(rounded);
});

const filterByProbability = (elements, perception) => {
  return elements.filter((e) => e.predicted_probability >= perception);
};

export const generateLocators = createAsyncThunk("main/generateLocators", async (predictedElements, thunkAPI) => {
  const availableForGeneration = filterByProbability(predictedElements, 0.5);
  const { locators, perception } = thunkAPI.getState().main;
  if (availableForGeneration.length) {
    const noLocator = availableForGeneration.filter(
        (element) => locators.findIndex((loc) => loc.element_id === element.element_id) === -1
    );
    if (noLocator.length) {
      const { generationData } = await requestGenerationData(noLocator);
      highlightElements(generationData, perception);
      thunkAPI.dispatch(xPathGenerationStarted());
      thunkAPI.dispatch(runXpathGeneration(generationData));
    }
  }
});

export const runXpathGeneration = createAsyncThunk("main/scheduleGeneration", async (generationData, thunkAPI) => {
  const { xpathConfig } = thunkAPI.getState().main;
  runGenerationHandler(generationData, xpathConfig, (el) =>
    thunkAPI.dispatch(updateLocator(el))
  );
});
