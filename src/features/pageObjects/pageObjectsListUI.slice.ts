import { createSlice } from '@reduxjs/toolkit';
import { pageObjAdapter } from './selectors/pageObjects.selectors';

export interface PageObjectsListUIState {
  isPageObjectsListUIEnabled: boolean;
}
const initialState: PageObjectsListUIState = {
  isPageObjectsListUIEnabled: true,
};

const pageObjectsListUI = createSlice({
  name: 'pageObject',
  initialState: pageObjAdapter.getInitialState(initialState),
  reducers: {
    enablePageObjectsListUI(state) {
      state.isPageObjectsListUIEnabled = true;
    },
    disablePageObjectsListUI(state) {
      state.isPageObjectsListUIEnabled = false;
    },
  },
});

export const { enablePageObjectsListUI, disablePageObjectsListUI } = pageObjectsListUI.actions;

export default pageObjectsListUI.reducer;
