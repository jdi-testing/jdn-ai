import { createAsyncThunk } from "@reduxjs/toolkit";
import { sendMessage } from "../utils/connector";
import { isProgressStatus, runGenerationHandler } from "../utils/locatorGenerationController";
import { getElements, requestGenerationData } from "../utils/pageDataHandlers";
import { changeLocatorSettings, stopXpathGeneration, updateLocator, xPathGenerationStarted } from "./predictionSlice";
import { selectLocatorById, selectLocators } from "./selectors";

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

export const runXpathGeneration = createAsyncThunk("main/scheduleGeneration", async (generationData, thunkAPI) => {
  const { xpathConfig } = thunkAPI.getState().main;
  await runGenerationHandler(generationData, xpathConfig, (el) => {
    thunkAPI.dispatch(updateLocator(el));
  });
  return generationData;
});

export const rerunGeneration = createAsyncThunk("main/rerunGeneration", async (generationData, thunkAPI) => {
  thunkAPI.dispatch(runXpathGeneration(generationData));
});

export const revertSettings = createAsyncThunk(
    "main/revertLocatorSettings",
    async ({ prevValue }, thunkAPI) => {
      prevValue.forEach((previousElement) => {
        const {element_id: id, locator} = previousElement;
        const state = thunkAPI.getState();
        const currentValue = selectLocatorById(state, id);

        if (isProgressStatus(currentValue.locator.taskStatus)) {
          thunkAPI.dispatch(stopXpathGeneration(id));
        }

        thunkAPI.dispatch(changeLocatorSettings([previousElement]));

        if (isProgressStatus(locator.taskStatus)) {
          thunkAPI.dispatch(runXpathGeneration(previousElement));
        } else {
          thunkAPI.dispatch(updateLocator(previousElement));
        }
      });
    }
);
