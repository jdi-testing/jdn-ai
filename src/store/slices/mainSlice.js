import { createSlice } from "@reduxjs/toolkit";
import { size } from "lodash";
import { BACKEND_STATUS, identificationStatus } from "../../utils/constants";

const initialState = {
  allowIdentifyElements: true,
  backendAvailable: BACKEND_STATUS.TRY_TO_ACCESS,
  notifications: [],
  pageHistory: [],
  perception: 0.5,
  scriptMessage: null,
  showBackdrop: false,
  xpathConfig: {
    maximum_generation_time: 10,
    allow_indexes_at_the_beginning: false,
    allow_indexes_in_the_middle: false,
    allow_indexes_at_the_end: false,
  }
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    changePage(state, { payload }) {
      state.pageHistory.push(payload);
    },
    changePageBack(state) {
      state.pageHistory.pop();
    },
    changePerception(state, { payload }) {
      state.perception = payload;
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
    resetNotifications(state) {
      state.notifications.length = 0;
    },
    setBackendAvailable(state, {payload}) {
      state.backendAvailable = payload;
    },
    setScriptMessage(state, { payload }) {
      state.scriptMessage = payload;
    },
    toggleBackdrop(state, { payload }) {
      state.showBackdrop = payload;
    },
  },
});

export default mainSlice.reducer;
export const {
  changePage,
  changePageBack,
  cancelLastNotification,
  changePerception,
  clearAll,
  handleLastNotification,
  pushNotification,
  resetNotifications,
  setBackendAvailable,
  setScriptMessage,
  toggleBackdrop,
} = mainSlice.actions;
