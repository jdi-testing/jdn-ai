import { createAsyncThunk } from "@reduxjs/toolkit";
import { getElements, highlightElements, requestGenerationData, runGenerationHandler } from "../utils/pageDataHandlers";

export const identifyElements = createAsyncThunk("main/identifyElements", async (data, thunkAPI) => {
  const onHighlighted = () => console.log("highlighted");
  const res = await getElements();
  highlightElements(res, onHighlighted, 0.5);
  thunkAPI.dispatch(generateLocators(res));
  return thunkAPI.fulfillWithValue(res);
});

const filterByProbability = (elements, perception) => {
  return elements.filter((e) => e.predicted_probability >= perception);
};

export const generateLocators = createAsyncThunk("main/generateLocators", async (predictedElements, thunkAPI) => {
  const availableForGeneration = filterByProbability(predictedElements, 0.5);
  const { xpathConfig, locators } = thunkAPI.getState().main;
  if (availableForGeneration.length) {
    const noLocator = availableForGeneration.filter(
        (element) => locators.findIndex((loc) => loc.element_id === element.element_id) === -1
    );
    if (noLocator.length) {
      const { generationData } = await requestGenerationData(noLocator, xpathConfig);
      runGenerationHandler(generationData, xpathConfig, (el) =>
        thunkAPI.dispatch(predictionSlice.actions.updateLocator(el))
      );
    }
  }
});
