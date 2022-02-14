import { createSlice } from "@reduxjs/toolkit";
import { size } from "lodash";
import { identificationStatus, pageType, xpathGenerationStatus } from "../utils/constants";

const initialState = {
  currentPage: pageType.pageObject,
  allowIdentifyElements: true,
  allowRemoveElements: false,
  showBackdrop: false,
  notifications: [],
  perception: 0.5,
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

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    changePage(state, {payload}) {
      state.currentPage = payload;
    },
    changePerception(state, { payload }) {
      state.perception = payload;
    },
    changeXpathSettings(state, { payload }) {
      state.xpathConfig = payload;
    },
    clearAll(state) {
      state.status = identificationStatus.removed;
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
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
    toggleBackdrop(state, { payload }) {
      state.showBackdrop = payload;
    },
    xPathGenerationStarted(state) {
      state.xpathStatus = xpathGenerationStatus.started;
    },
  },
});

export default mainSlice.reducer;
export const {
  changePage,
  cancelLastNotification,
  changePerception,
  changeXpathSettings,
  clearAll,
  handleLastNotification,
  pushNotification,
  setUnactualPrediction,
  toggleDeleted,
  toggleBackdrop,
  xPathGenerationStarted,
} = mainSlice.actions;
