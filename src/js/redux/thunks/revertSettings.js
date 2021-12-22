import { createAsyncThunk } from "@reduxjs/toolkit";
import { isProgressStatus } from "../../utils/locatorGenerationController";
import { changeLocatorSettings, updateLocator } from "../predictionSlice";
import { selectLocatorById } from "../selectors";
import { runXpathGeneration } from "./runXpathGeneration";
import { stopGeneration } from "./stopGeneration";


export const revertSettings = createAsyncThunk(
    "main/revertLocatorSettings",
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
