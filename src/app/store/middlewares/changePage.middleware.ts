import { Middleware } from '@reduxjs/toolkit';
import { changePage } from '../../main.slice';
import { PageType } from '../../types/mainSlice.types';

export const changePageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  switch (action.type) {
    case 'locators/identifyElements/fulfilled':
      store.dispatch(changePage({ page: PageType.LocatorsList }));
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
