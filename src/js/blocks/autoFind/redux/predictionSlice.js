import { createSlice } from "@reduxjs/toolkit";
import { findIndex } from "lodash";
import { autoFindStatus, xpathGenerationStatus } from "../autoFindProvider/AutoFindProvider";
import { sendMessage } from "../utils/connector";
import { getJdiClassName } from "../utils/generationClassesMap";
import { stopGenerationHandler } from "../utils/pageDataHandlers";
import { generateLocators, identifyElements } from "./thunks";

const initialState = {
  status: autoFindStatus.noStatus,
  allowIdentifyElements: true,
  allowRemoveElements: false,
  isModalOpen: false,
  locators: [],
  notifications: [],
  perception: 0.5,
  predictedElements: [],
  unactualPrediction: false,
  unreachableNodes: [], // sendMessage.highlightUnreached(unreachableNodes);
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
    changeElementName(state, { payload: { id, name } }) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: id });
      locators[index].name = name;
      locators[index].isCustomName = true;
      sendMessage.changeElementName(locators[index]);
    },
    changeLocatorXpathSettings(state, {payload: {id, settings}}) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: id });
      locators[index].locator.settings = settings;
    },
    changePerception(state, {payload}) {
      state.perception = payload;
    },
    changeXpathSettings(state, { payload }) {
      state.xpathConfig = payload;
    },
    changeType(state, { payload: { id, newType } }) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: id });
      locators[index].type = newType;
      if (!locators[index].isCustomName) locators[index].name = getJdiClassName(newType);
    },
    clearAll(state) {
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
      state.status = autoFindStatus.removed;
    },
    pushNotification(state, {payload}) {
      state.notifications.push(payload);
    },
    setUnactualPrediction(state, {payload}) {
      state.unactualPrediction = payload;
    },
    stopXpathGeneration(state, {payload}) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: payload });
      locators[index].stopped = true;
      stopGenerationHandler(payload);
    },
    toggleElementGeneration(state, { payload }) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: payload });
      locators[index].generate = !locators[index].generate;
      sendMessage.toggle(locators[index]);
    },
    toggleDeleted(state, { payload }) {
      const locators = state.locators;
      const index = findIndex(state.locators, { element_id: payload });
      locators[index].deleted = !locators[index].deleted;
      sendMessage.toggleDeleted(locators[index]);
    },
    toggleBackdrop(state, {payload}) {
      state.isModalOpen = payload;
    },
    updateLocator(state, { payload }) {
      const locators = state.locators;
      const index = findIndex(locators, { element_id: payload.element_id });
      if (index === -1) {
        locators.push(payload);
      } else {
        locators[index].locator = payload.locator;
      }
      sendMessage.changeStatus(payload);
    },
    xPathGenerationStarted(state) {
      state.xpathStatus = xpathGenerationStatus.started;
    },
    addCmElementHighlight(state, { payload }) {
      const locators = state.locators;
      const elem = locators.find((e) => e.element_id === payload);
      elem.isCmHighlighted = true;
    },
    clearCmElementHighlight(state, { payload }) {
      const locators = state.locators;
      const elem = locators.find((e) => e.element_id === payload);
      elem.isCmHighlighted = false;
    },
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
        .addCase(identifyElements.rejected, (state, { error }) => {
          throw new Error(error.stack);
        })
        .addCase(generateLocators.pending, (state, action) => {
          state.schedulerStatus = "pending";
        })
        .addCase(generateLocators.fulfilled, (state, { payload }) => {
          state.schedulerStatus = "scheduled";
        })
        .addCase(generateLocators.rejected, (state, { error }) => {
          throw new Error(error.stack);
        });
  },
});

export default predictionSlice.reducer;
export const {
  changeType,
  changeElementName,
  changeLocatorXpathSettings,
  changeXpathSettings,
  clearAll,
  changePerception,
  pushNotification,
  setUnactualPrediction,
  stopXpathGeneration,
  toggleElementGeneration,
  toggleDeleted,
  toggleBackdrop,
  updateLocator,
  xPathGenerationStarted,
  addCmElementHighlight,
  clearCmElementHighlight,
} = predictionSlice.actions;
