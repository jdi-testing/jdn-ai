import { createSlice } from "@reduxjs/toolkit";
import { size } from "lodash";
import { defineServerReducer } from "../thunks/defineServer";
import { BackendStatus, MainState } from "./mainSlice.types";

const initialState: MainState = {
  allowIdentifyElements: true,
  backendAvailable: BackendStatus.TryToAccess,
  notifications: [],
  pageHistory: [],
  perception: 0.5,
  scriptMessage: null,
  showBackdrop: false,
  xpathConfig: {
    maximum_generation_time: 1,
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
    clearAll: (state) => ({...initialState, backendAvailable: state.backendAvailable}),
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
  extraReducers: (builder) => {
    defineServerReducer(builder);
  }
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
