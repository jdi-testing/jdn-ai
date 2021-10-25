import { createSlice } from "@reduxjs/toolkit";
import { findIndex } from "lodash";
import { autoFindStatus, xpathGenerationStatus } from "../autoFindProvider/AutoFindProvider";
import { sendMessage } from "../utils/connector";
import { generateLocators, identifyElements } from "./thunks";

const initialState = {
  status: autoFindStatus.noStatus,
  allowIdentifyElements: true,
  allowRemoveElements: false,
  predictedElements: [],
  locators: [],
  xpathStatus: xpathGenerationStatus.noStatus,
  xpathConfig: {
    maximum_generation_time: 10,
    allow_indexes_at_the_beginning: false,
    allow_indexes_in_the_middle: false,
    allow_indexes_at_the_end: true,
    limit_maximum_generation_time: true,
  },
};

const predictionSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    toggleElementGeneration(state, {payload}) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: payload });
      locators[index].generate = !locators[index].generate;
      sendMessage.toggle(locators[index]);
    },
    updateLocator(state, {payload}) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: payload.element_id });
      if (index === -1) {
        locators.push(payload);
      } else {
        locators[index].locator = payload.locator;
      }
    },
    clearAll(state) {
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
      state.status = autoFindStatus.removed;
    },
    xPathGenerationStarted(state) {
      state.xpathStatus = xpathGenerationStatus.started;
    }
  },
  extraReducers: (builder) => {
    builder
        .addCase(identifyElements.pending, (state, action) => {
          state.status = autoFindStatus.loading;
          state.allowIdentifyElements = false;
        })
        .addCase(identifyElements.fulfilled, (state, { payload }) => {
          state.status = autoFindStatus.success;
          state.allowRemoveElements = true;
          state.predictedElements = payload;
        })
        .addCase(identifyElements.rejected, (state, {error}) => {
          throw new Error(error.stack);
        })
        .addCase(generateLocators.pending, (state, action) => {
          state.schedulerStatus = "pending";
        })
        .addCase(generateLocators.fulfilled, (state, { payload }) => {
          state.schedulerStatus = "scheduled";
        })
        .addCase(generateLocators.rejected, (state, {error}) => {
          throw new Error(error.stack);
        });
  },
});

export default predictionSlice.reducer;
export const { clearAll, updateLocator, toggleElementGeneration, xPathGenerationStarted } = predictionSlice.actions;
