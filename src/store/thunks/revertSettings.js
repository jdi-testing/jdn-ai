import { createAsyncThunk } from "@reduxjs/toolkit";

import { changeLocatorSettings, updateLocator } from "../locatorsSlice";
import { isProgressStatus } from "../../services/locatorGenerationController";
import { runXpathGeneration } from "./runXpathGeneration";
import { selectLocatorById } from "../selectors";
import { stopGeneration } from "./stopGeneration";

export const revertSettings = createAsyncThunk(
    "locators/revertLocatorSettings",
    async ({ prevValue }, thunkAPI) => {
      prevValue.forEach((previousElement) => {
        const {element_id: id, locator} = previousElement;
        const state = thunkAPI.getState();
        const currentValue = selectLocatorById(state, id);

        if (isProgressStatus(currentValue.locator.taskStatus)) {
          thunkAPI.dispatch(stopGeneration(id));
        }

        thunkAPI.dispatch(changeLocatorSettings([previousElement]));

        if (isProgressStatus(locator.taskStatus)) {
          thunkAPI.dispatch(runXpathGeneration([previousElement]));
        } else {
          thunkAPI.dispatch(updateLocator(previousElement));
        }
      });
    }
);
