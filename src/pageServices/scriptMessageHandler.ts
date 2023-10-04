import { AsyncThunkAction } from '@reduxjs/toolkit';
import { Dispatch } from 'react';
import { setScriptMessage } from '../app/main.slice';
import { RootState } from '../app/store/store';
import { ILocator, LocatorTaskStatus } from '../features/locators/types/locator.types';
import {
  elementGroupSetActive,
  elementGroupUnsetActive,
  elementSetActive,
  setScrollToLocator,
  toggleDeletedGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
  toggleElementGroupIsChecked,
  updateLocatorGroup,
} from '../features/locators/locators.slice';
import connector from './connector';
import { showOverlay } from './pageDataHandlers';
import { rerunGeneration } from '../features/locators/reducers/rerunGeneration.thunk';
import { stopGenerationGroup } from '../features/locators/reducers/stopGenerationGroup.thunk';
import { copyLocator } from '../features/locators/utils/utils';
import { selectLocatorByJdnHash } from '../features/locators/selectors/locators.selectors';
import { ScriptMsg, dispatchingMessages } from './scriptMsg.constants';
import { selectPresentActiveLocators } from '../features/locators/selectors/locatorsByPO.selectors';
import { selectCurrentPageObject } from '../features/pageObjects/selectors/pageObjects.selectors';
import { FrameworkType } from '../common/types/common';

export type ScriptMessagePayload = { message: keyof Actions; param: Record<string, never> };

type Response<T> = (payload: T, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void;

type Actions<P = any> = Partial<Record<ScriptMsg, Response<P>>>;

export const updateMessageHandler = (
  dispatch: Dispatch<{ payload?: any; type?: string } | AsyncThunkAction<any, any, any>>,
  state: RootState,
) => {
  const actions: Actions = {
    [ScriptMsg.AdvancedCalculation]: ({ locators, time }) => {
      dispatch(
        rerunGeneration({
          generationData: locators,
          maxGenerationTime: time,
        }),
      );
    },
    [ScriptMsg.CopyLocator]: ({ value, option }) => {
      const pageObject = selectCurrentPageObject(state)!;
      const framework = pageObject?.framework || FrameworkType.JdiLight;
      copyLocator(framework, value, option)();
    },
    [ScriptMsg.ElementSelect]: (payload) => {
      dispatch(elementSetActive(payload.element_id));
    },
    [ScriptMsg.ElementGroupSetActive]: (payload) => {
      const locators = payload.map((jdnHash: string) => selectLocatorByJdnHash(state, jdnHash));
      dispatch(elementGroupSetActive({ locators, fromScript: true }));
      dispatch(setScrollToLocator(locators[0].element_id));
    },
    [ScriptMsg.ElementGroupUnsetActive]: (payload) => {
      const locators = payload.map((jdnHash: string) => selectLocatorByJdnHash(state, jdnHash)) as ILocator[];
      dispatch(elementGroupUnsetActive({ locators, fromScript: true }));
    },
    [ScriptMsg.GetActiveElements]: (_, sender, sendResponse) => {
      const elements = selectPresentActiveLocators(state);
      sendResponse({
        elements,
      });
    },
    [ScriptMsg.RemoveElement]: (payload) => dispatch(toggleDeletedGroup(payload)),
    [ScriptMsg.ResponseCssSelectors]: (payload) => {
      const locators = payload.map(({ element_id, locator }: ILocator) => {
        return {
          element_id,
          locator: { ...locator, cssSelectorStatus: LocatorTaskStatus.SUCCESS },
        };
      });
      const pageObject = selectCurrentPageObject(state)!;
      dispatch(updateLocatorGroup({ locators, pageObject }));
    },
    [ScriptMsg.RestoreElement]: (payload) => dispatch(toggleDeletedGroup(payload)),
    [ScriptMsg.OpenEditLocator]: () => {
      // handled in Locator
    },
    [ScriptMsg.RerunGeneration]: (payload) => {
      dispatch(rerunGeneration({ generationData: payload }));
    },
    [ScriptMsg.StartCollectData]: showOverlay,
    /* eslint-disable */
    // @ts-ignore
    [ScriptMsg.StopGroupGeneration]: (payload) => dispatch(stopGenerationGroup(payload)),
    [ScriptMsg.ToggleElement]: (payload) => {
      dispatch(toggleElementGeneration(payload[0]));
      dispatch(setScrollToLocator(payload[0].element_id));
    },
    [ScriptMsg.ToggleElementGroup]: (payload) => {
      dispatch(toggleElementGroupGeneration(payload));
    },
    [ScriptMsg.ToggleElementGroupIsChecked]: (payload) => {
      dispatch(toggleElementGroupIsChecked(payload));
    },
  };

  const messageHandler = (
    { message, param }: ScriptMessagePayload,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: Record<string, never>) => void,
    _actions: Actions
  ) => {
    if (_actions[message]) {
      _actions[message]!(param, sender, sendResponse);
      if (dispatchingMessages.includes(message)) dispatch(setScriptMessage({ message, param }));
    }
  };

  connector.updateMessageListener(
    (payload: ScriptMessagePayload, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) =>
      messageHandler(payload, sender, sendResponse, actions)
  );
};
