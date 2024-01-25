import { Middleware } from '@reduxjs/toolkit';
import { changePage } from '../../main.slice';
import { PageType } from '../../types/mainSlice.types';
import { selectIsProgressBarFinished } from '../../../features/pageObjects/selectors/progressBar.selector';

export const changePageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const checkInterval = 100;

  switch (action.type) {
    case 'locators/identifyElements/fulfilled':
      const checkProgressBarFinished = setInterval(() => {
        const state = store.getState();
        const isProgressBarFinished = selectIsProgressBarFinished(state);
        if (isProgressBarFinished) {
          clearInterval(checkProgressBarFinished);
          // navigate to LocatorsListPage:
          store.dispatch(changePage({ page: PageType.LocatorsList }));
        }
      }, checkInterval);
      break;
    case 'locators/checkLocatorsValidity/fulfilled':
      store.dispatch(
        changePage({
          page: PageType.LocatorsList,
          alreadyGenerated: true,
        }),
      );
      break;
  }

  return result;
};
