import { PageObjectState } from './types/pageObjectSlice.types';

export const UIReducers = {
  enablePageObjectsListUI(state: PageObjectState) {
    state.isPageObjectsListUIEnabled = true;
  },
  disablePageObjectsListUI(state: PageObjectState) {
    state.isPageObjectsListUIEnabled = false;
  },
};
