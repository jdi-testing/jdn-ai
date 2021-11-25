import { createSlice } from "@reduxjs/toolkit";
import { size } from "lodash";
import { autoFindStatus, xpathGenerationStatus } from "../autoFindProvider/AutoFindProvider";
import { getJdiClassName } from "../utils/generationClassesMap";
import { stopGenerationHandler } from "../utils/locatorGenerationController";
import { locatorsAdapter, simpleSelectLocatorById } from "./selectors";
import { generateLocators, identifyElements, rerunGeneration } from "./thunks";

const initialState = {
  status: autoFindStatus.noStatus,
  allowIdentifyElements: true,
  allowRemoveElements: false,
  isModalOpen: false,
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
  initialState: locatorsAdapter.getInitialState(initialState),
  reducers: {
    changeElementName(state, { payload: { id, name } }) {
      const locator = simpleSelectLocatorById(state, id);
      locatorsAdapter.upsertOne(state, {...locator, name: name, isCustomName: true});
    },
    changeLocatorSettings(state, {payload}) {
      locatorsAdapter.upsertMany(state, payload);
    },
    changePerception(state, {payload}) {
      state.perception = payload;
    },
    changeXpathSettings(state, { payload }) {
      state.xpathConfig = payload;
    },
    changeType(state, { payload: { id, newType } }) {
      const locator = simpleSelectLocatorById(state, id);
      const newValue = {...locator, type: newType};
      if (!locator.isCustomName) newValue.name = getJdiClassName(newType);
      locatorsAdapter.upsertOne(state, newValue);
    },
    clearAll(state) {
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
      locatorsAdapter.removeAll(state);
      state.status = autoFindStatus.removed;
    },
    pushNotification(state, {payload}) {
      state.notifications.push(payload);
    },
    cancelLastNotification(state) {
      state.notifications[size(state.notifications) -1].isCanceled = true;
    },
    handleLastNotification(state) {
      state.notifications[size(state.notifications) -1].isHandled = true;
    },
    setUnactualPrediction(state, {payload}) {
      state.unactualPrediction = payload;
    },
    stopXpathGeneration(state, {payload}) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, {...locator, stopped: true});
      stopGenerationHandler(payload);
    },
    stopXpathGenerationGroup(state, {payload}) {
      const newValue = [];
      payload.forEach((locator) => {
        newValue.push({...locator, stopped: true});
        stopGenerationHandler(locator.element_id);
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    toggleElementGeneration(state, { payload }) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, {...locator, generate: !locator.generate});
    },
    toggleElementGroupGeneration(state, { payload }) {
      const newValue = [];
      payload.forEach((locator) => {
        newValue.push({...locator, generate: !locator.generate});
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    toggleDeleted(state, { payload }) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, {...locator, deleted: !locator.deleted});
    },
    toggleDeletedGroup(state, { payload }) {
      const newValue = [];
      payload.forEach((locator) => {
        newValue.push({...locator, deleted: !locator.deleted});
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    toggleBackdrop(state, {payload}) {
      state.isModalOpen = payload;
    },
    updateLocator(state, { payload }) {
      locatorsAdapter.upsertOne(state, payload);
    },
    xPathGenerationStarted(state) {
      state.xpathStatus = xpathGenerationStatus.started;
    },
    addCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, {element_id: payload, isCmHighlighted: true});
    },
    clearCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, {element_id: payload, isCmHighlighted: false});
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
        })
        .addCase(rerunGeneration.pending, (state, {meta}) => {
          const {arg} = meta;
          arg.forEach(({element_id}) => {
            locatorsAdapter.upsertOne(state, {element_id, stopped: false});
          });
        });
  },
});

export default predictionSlice.reducer;
export const {
  cancelLastNotification,
  changeType,
  changeElementName,
  changeLocatorSettings,
  changeXpathSettings,
  clearAll,
  changePerception,
  handleLastNotification,
  pushNotification,
  setUnactualPrediction,
  stopXpathGeneration,
  stopXpathGenerationGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  toggleBackdrop,
  updateLocator,
  xPathGenerationStarted,
  addCmElementHighlight,
  clearCmElementHighlight,
} = predictionSlice.actions;
