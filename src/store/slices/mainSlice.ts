import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { size } from "lodash";
import { defineServerReducer } from "../thunks/defineServer";
import { BackendStatus, MainState, Notification, PageType } from "./mainSlice.types";
import { PageObjectId } from "./pageObjectSlice.types";

const initialState: MainState = {
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
  },
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    changePage(
        state,
        { payload }: PayloadAction<{ page: PageType; pageObj?: PageObjectId; alreadyGenerated?: boolean }>
    ) {
      state.pageHistory.push(payload);
      state.notifications = [];
    },
    changePageBack(state) {
      state.pageHistory.pop();
      state.notifications = [];
    },
    changePerception(state, { payload }) {
      state.perception = payload;
    },
    clearAll: (state) => {
      const { backendAvailable, baseUrl, serverVersion } = state;
      return { ...initialState, backendAvailable, baseUrl, serverVersion };
    },
    pushNotification(state, { payload }: PayloadAction<Notification>) {
      state.notifications.push(payload);
    },
    resetNotifications(state) {
      state.notifications.length = 0;
    },
    setBackendAvailable(state, { payload }) {
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
  },
});

export default mainSlice.reducer;
export const {
  changePage,
  changePageBack,
  changePerception,
  clearAll,
  pushNotification,
  resetNotifications,
  setBackendAvailable,
  setScriptMessage,
  toggleBackdrop,
} = mainSlice.actions;
