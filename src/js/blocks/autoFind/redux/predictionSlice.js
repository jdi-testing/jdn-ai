import { createSlice } from "@reduxjs/toolkit";
import { lowerFirst, size } from "lodash";
import { autoFindStatus, xpathGenerationStatus } from "../autoFindProvider/AutoFindProvider";
import { getJdiClassName, getJDILabel } from "../utils/generationClassesMap";
import { locatorsAdapter, simpleSelectLocatorById } from "./selectors";
import { cancelStopGenerationReducer } from "./thunks/cancelStopGeneration";
import { generateLocatorsReducer } from "./thunks/generateLocators";
import { identifyElementsReducer } from "./thunks/identifyElements";
import { rerunGenerationReducer } from "./thunks/rerunGeneration";
import { stopGenerationReducer } from "./thunks/stopGeneration";
import { stopGenerationGroupReducer } from "./thunks/stopGenerationGroup";

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
        newValue.name = lowerFirst(getJdiClassName(type));
        newValue.type = getJDILabel(type);
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
      state.status = autoFindStatus.removed;
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
      locatorsAdapter.removeAll(state);
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
    identifyElementsReducer(builder),
    generateLocatorsReducer(builder),
    stopGenerationReducer(builder),
    stopGenerationGroupReducer(builder),
    cancelStopGenerationReducer(builder),
    rerunGenerationReducer(builder);
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
