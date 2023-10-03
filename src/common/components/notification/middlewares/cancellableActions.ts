import { Middleware } from '@reduxjs/toolkit';
import { compact } from 'lodash';
import { selectLocatorById } from '../../../../features/locators/selectors/locators.selectors';
import { ILocator } from '../../../../features/locators/types/locator.types';
import { pushNotification } from '../../../../app/main.slice';
import { RootState } from '../../../../app/store/store';

export const cancellableActions: Middleware = (store) => (next) => (action) => {
  const prevState: RootState = store.getState();
  const result = next(action);

  const pushNotificationHandler = (prevValue?: any) => {
    store.dispatch(pushNotification({ action, prevValue }));
  };

  const { type, payload, meta } = action;
  switch (type) {
    case 'locators/stopGeneration/fulfilled':
    case 'pageObject/removeAll':
    case 'pageObject/removePageObject':
    case 'pageObject/changeName': {
      pushNotificationHandler();
      break;
    }
    case 'locators/rerunGeneration/fulfilled':
      pushNotificationHandler(meta.arg);
      break;
    case 'locators/stopGenerationGroup/fulfilled': {
      const _arr: ILocator[] = compact(payload);
      pushNotificationHandler(_arr);
      break;
    }
    case 'locators/changeLocatorAttributes':
    case 'locators/changeLocatorElement/fulfilled': {
      const { element_id } = payload;
      pushNotificationHandler(selectLocatorById(prevState, element_id));
      break;
    }
    case 'locators/toggleDeleted':
      pushNotificationHandler(selectLocatorById(prevState, payload));
      break;
    case 'locators/toggleDeletedGroup':
      pushNotificationHandler(payload);
      break;
  }
  return result;
};
