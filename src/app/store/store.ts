import { configureStore } from '@reduxjs/toolkit';
import undoable from 'redux-undo';

import mainSlice from '../main.slice';
import filterSlice from '../../features/filter/filter.slice';
import locatorsSlice from '../../features/locators/locators.slice';
import customLocatorSlice from '../../features/locators/customLocator.slice';
import onboardingSlice from '../../features/onboarding/store/onboarding.slice';
import pageObjectSlice from '../../features/pageObjects/pageObject.slice';
import pageObjectsListUISlice from '../../features/pageObjects/pageObjectsListUI.slice';
import vividusViewSlice from '../../features/locators/VividusView.slice';

import { scriptNotifier } from '../../pageServices/scriptNotifier';
import { updateMessageHandler } from '../../pageServices/scriptMessageHandler';

import { updateSocketMessageHandler } from '../../services/webSocketMessageHandler';

import { logger } from './middlewares/logger';
import { changePageMiddleware } from './middlewares/changePage.middleware';
import { shouldRunGeneration } from '../../features/locators/reducers/shouldRunGeneration.middleware';
import { cancellableActions } from '../../common/components/notification/middlewares/cancellableActions';

import { onLocatorsCreated } from '../../features/locators/reducers/identifyElements.thunk';

import { quitThrottlerMiddleware } from '../../common/utils/throttler';
import progressBarSlice from '../../features/pageObjects/progressBar.slice';
import pageDocumentSlice from '../../services/pageDocument/pageDocument.slice';

import { useDispatch } from 'react-redux';

const rootReducer = {
  main: mainSlice,
  filters: filterSlice,
  locators: undoable(locatorsSlice, { undoType: 'LOCATOR_UNDO', jumpType: 'LOCATOR_JUMP' }),
  pageObject: undoable(pageObjectSlice, { undoType: 'PAGEOBJECT_UNDO' }),
  progressBar: progressBarSlice,
  pageObjectsListUI: pageObjectsListUISlice,
  onboarding: onboardingSlice,
  customLocator: customLocatorSlice,
  pageDocument: pageDocumentSlice,
  vividusView: vividusViewSlice,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'locators/setElementGroupGeneration',
          'locators/elementSetActive',
          'locators/elementGroupSetActive',
          'locators/setActiveSingle',
          'locators/updateLocatorGroup',
          'main/setScriptMessage',
        ],
      },
    }).concat([
      logger,
      scriptNotifier,
      cancellableActions,
      changePageMiddleware,
      shouldRunGeneration,
      quitThrottlerMiddleware,
      onLocatorsCreated,
    ]),
});

store.subscribe(() => updateMessageHandler(store.dispatch, store.getState()));
store.subscribe(() => updateSocketMessageHandler(store.dispatch, store.getState()));

export const useAppDispatch = () => useDispatch<AppDispatch>();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
