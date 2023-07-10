import { AsyncThunkAction } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import { setScriptMessage } from "../app/main.slice";
import { RootState } from "../app/store/store";
import { Locator, LocatorValidationErrors, LocatorValidationWarnings } from "../features/locators/types/locator.types";
import {
  elementGroupSetActive,
  elementGroupUnsetActive,
  elementSetActive,
  setJdnHash,
  setScrollToLocator,
  setValidity,
  toggleDeletedGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
} from "../features/locators/locators.slice";
import connector from "./connector";
import { showOverlay } from "./pageDataHandlers";
import { rerunGeneration } from "../features/locators/reducers/rerunGeneration.thunk";
import { stopGenerationGroup } from "../features/locators/reducers/stopGenerationGroup.thunk";
import { copyLocator } from "../features/locators/utils/utils";
import { selectLocatorByJdnHash } from "../features/locators/selectors/locators.selectors";
import { selectActiveLocators } from "../features/locators/selectors/locatorsFiltered.selectors";
import { ScriptMsg } from "./scriptMsg.constants";

export type ScriptMessagePayload = { message: keyof Actions; param: Record<string, never> };

type Response<T> = (payload: T, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void;

type Actions<P = any> = Record<string, Response<P>>;

export const updateMessageHandler = (
  dispatch: Dispatch<{ payload?: any; type?: string } | AsyncThunkAction<any, any, any>>,
  state: RootState
) => {
  const actions: Actions = {
    [ScriptMsg.AdvancedCalculation]: ({ locators, time }) => {
      dispatch(
        rerunGeneration({
          generationData: locators,
          maxGenerationTime: time,
        })
      );
    },
    [ScriptMsg.CopyLocator]: ({ value, option }) => {
      copyLocator(value, option)();
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
      const locators = payload.map((jdnHash: string) => selectLocatorByJdnHash(state, jdnHash)) as Locator[];
      dispatch(elementGroupUnsetActive({ locators, fromScript: true }));
    },
    [ScriptMsg.GetActiveElements]: (_, sender, sendResponse) => {
      const elements = selectActiveLocators(state);
      sendResponse({
        elements,
      });
    },
    [ScriptMsg.RemoveElement]: (payload) => dispatch(toggleDeletedGroup(payload)),
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
  };

  const messageHandler = (
    { message, param }: ScriptMessagePayload,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: Record<string, never>) => void,
    _actions: Actions
  ) => {
    if (_actions[message]) {
      _actions[message](param, sender, sendResponse);
      dispatch(setScriptMessage({ message, param }));
    }
  };

  connector.updateMessageListener(
    (payload: ScriptMessagePayload, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) =>
      messageHandler(payload, sender, sendResponse, actions)
  );
};
