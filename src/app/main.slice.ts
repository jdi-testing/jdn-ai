import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { defineServerReducer } from './reducers/defineServer.thunk';
import { PageObjectId } from '../features/pageObjects/types/pageObjectSlice.types';
import { BackendStatus, MainState, Notification, PageType } from './types/mainSlice.types';
import { removeAllReducer } from './reducers/removeAll.thunk';
import { redefineServerReducer } from './reducers/redefineServer.thunk';

const initialState: MainState = {
  backendAvailable: BackendStatus.TryToAccess,
  isSessionUnique: true,
  notifications: [],
  pageHistory: [],
  scriptMessage: null,
  xpathConfig: {
    maximum_generation_time: 1,
    allow_indexes_at_the_beginning: false,
    allow_indexes_in_the_middle: false,
    allow_indexes_at_the_end: false,
  },
};

const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    changePage(
      state,
      { payload }: PayloadAction<{ page: PageType; pageObj?: PageObjectId; alreadyGenerated?: boolean }>,
    ) {
      state.pageHistory.push(payload);
      state.notifications = [];
    },
    changePageBack(state) {
      state.pageHistory.pop();
      state.notifications = [];
    },
    clearAll: (state) => {
      const { backendAvailable, baseUrl, serverVersion } = state;
      return { ...initialState, backendAvailable, baseUrl, serverVersion };
    },
    pushNotification(state, { payload }: PayloadAction<Notification>) {
      state.notifications.push(payload);
    },
    setScriptMessage(state, { payload }) {
      state.scriptMessage = payload;
    },
    setIsSessionUnique(state, { payload }: PayloadAction<boolean>) {
      state.isSessionUnique = payload;
    },
  },
  extraReducers: (builder) => {
    defineServerReducer(builder), redefineServerReducer(builder), removeAllReducer(builder);
  },
});

export default mainSlice.reducer;
export const { changePage, changePageBack, clearAll, pushNotification, setScriptMessage, setIsSessionUnique } =
  mainSlice.actions;
