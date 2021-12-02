import { createSlice } from "@reduxjs/toolkit";
import { size } from "lodash";
import { autoFindStatus, xpathGenerationStatus } from "../autoFindProvider/AutoFindProvider";
import { getJdiClassName } from "../utils/generationClassesMap";
import { locatorTaskStatus } from "../utils/locatorGenerationController";
import { locatorsAdapter, simpleSelectLocatorById } from "./selectors";
import {
  cancelStopGeneration,
  generateLocators,
  identifyElements,
  rerunGeneration,
  stopGeneration,
  stopGenerationGroup,
} from "./thunks";

const initialState = {
  status: autoFindStatus.noStatus,
  allowIdentifyElements: true,
  allowRemoveElements: false,
  showBackdrop: false,
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
    changeLocatorAttributes(state, { payload }) {
      const { type, name, locator, element_id } = payload;
      const _locator = simpleSelectLocatorById(state, element_id);
      const { fullXpath, robulaXpath } = _locator.locator;
      const newValue = { ..._locator, locator: { ..._locator.locator } };
      if (_locator.name !== name) {
        newValue.name = name;
        newValue.isCustomName = true;
      }
      if (_locator.type !== type && !newValue.isCustomName) {
        newValue.name = getJdiClassName(type);
        newValue.type = type;
      }
      if (fullXpath !== locator && robulaXpath !== locator) {
        newValue.locator.customXpath = locator;
        newValue.isCustomLocator = true;
        if (newValue.stopped) newValue.stopped = false;
      }
      locatorsAdapter.upsertOne(state, newValue);
    },
    changeLocatorSettings(state, { payload }) {
      locatorsAdapter.upsertMany(state, payload);
    },
    changePerception(state, { payload }) {
      state.perception = payload;
    },
    changeXpathSettings(state, { payload }) {
      state.xpathConfig = payload;
    },
    clearAll(state) {
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
      locatorsAdapter.removeAll(state);
      state.status = autoFindStatus.removed;
    },
    pushNotification(state, { payload }) {
      state.notifications.push(payload);
    },
    cancelLastNotification(state) {
      state.notifications[size(state.notifications) - 1].isCanceled = true;
    },
    handleLastNotification(state) {
      state.notifications[size(state.notifications) - 1].isHandled = true;
    },
    setUnactualPrediction(state, { payload }) {
      state.unactualPrediction = payload;
    },
    toggleElementGeneration(state, { payload }) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, { ...locator, generate: !locator.generate });
    },
    toggleElementGroupGeneration(state, { payload }) {
      const newValue = [];
      payload.forEach((locator) => {
        newValue.push({ ...locator, generate: !locator.generate });
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    toggleDeleted(state, { payload }) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, { ...locator, deleted: !locator.deleted });
    },
    toggleDeletedGroup(state, { payload }) {
      const newValue = [];
      payload.forEach((locator) => {
        newValue.push({ ...locator, deleted: !locator.deleted });
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    toggleBackdrop(state, { payload }) {
      state.showBackdrop = payload;
    },
    updateLocator(state, { payload }) {
      const { element_id, locator } = payload;
      const isLocaotrExists = simpleSelectLocatorById(state, element_id);
      if (isLocaotrExists) {
        locatorsAdapter.upsertOne(state, { element_id, locator: locator });
      } else {
        locatorsAdapter.addOne(state, payload);
      }
    },
    xPathGenerationStarted(state) {
      state.xpathStatus = xpathGenerationStatus.started;
    },
    addCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, { element_id: payload, isCmHighlighted: true });
    },
    clearCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, { element_id: payload, isCmHighlighted: false });
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
        .addCase(stopGeneration.pending, (state, { meta }) => {
          state.showBackdrop = true;
          const element_id = meta.arg;
          locatorsAdapter.upsertOne(state, { element_id, stopped: true });
        })
        .addCase(stopGeneration.fulfilled, (state, { meta }) => {
          state.showBackdrop = false;
          const element = simpleSelectLocatorById(state, meta.arg);
          const { element_id, locator } = element;
          locatorsAdapter.upsertOne(state, {
            element_id,
            locator: { ...locator, taskStatus: locatorTaskStatus.REVOKED },
          });
        })
        .addCase(stopGeneration.rejected, (state, { error }) => {
          state.showBackdrop = false;
          throw new Error(error.stack);
        })
        .addCase(stopGenerationGroup.pending, (state, { meta }) => {
          state.showBackdrop = true;
          const newValue = meta.arg.map(({ element_id }) => {
            return {
              element_id,
              stopped: true,
            };
          });
          locatorsAdapter.upsertMany(state, newValue);
        })
        .addCase(stopGenerationGroup.fulfilled, (state, { meta }) => {
          state.showBackdrop = false;
          const newStatuses = meta.arg.map(({ element_id, locator }) => {
            return {
              element_id,
              locator: { ...locator, taskStatus: locatorTaskStatus.REVOKED },
            };
          });
          locatorsAdapter.upsertMany(state, newStatuses);
        })
        .addCase(stopGenerationGroup.rejected, (state, { error }) => {
          state.showBackdrop = false;
          throw new Error(error.stack);
        })
        .addCase(rerunGeneration.pending, (state, { meta }) => {
          const { arg } = meta;
          arg.forEach(({ element_id }) => {
            locatorsAdapter.upsertOne(state, { element_id, stopped: false });
          });
        })
        .addCase(cancelStopGeneration.pending, (state, { meta }) => {
          const { arg } = meta;
          arg.forEach(({ element_id }) => {
            locatorsAdapter.upsertOne(state, { element_id, stopped: false });
          });
        });
  },
});

export default predictionSlice.reducer;
export const {
  cancelLastNotification,
  changeLocatorAttributes,
  changeLocatorSettings,
  changeXpathSettings,
  clearAll,
  changePerception,
  handleLastNotification,
  pushNotification,
  setUnactualPrediction,
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
