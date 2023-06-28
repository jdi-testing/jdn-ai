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
import { selectLocatorByJdnHash, selectActiveLocators } from "../features/pageObjects/pageObject.selectors";
import connector from "./connector";
import { showOverlay } from "./pageDataHandlers";
import { rerunGeneration } from "../features/locators/reducers/rerunGeneration.thunk";
import { stopGenerationGroup } from "../features/locators/reducers/stopGenerationGroup.thunk";
import { copyLocator } from "../features/locators/utils/utils";

export type ScriptMessagePayload = { message: keyof Actions; param: Record<string, never> };

type Response<T> = (payload: T, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void;

type Actions<P = any> = Record<string, Response<P>>;

export const updateMessageHandler = (
  dispatch: Dispatch<{ payload?: any; type?: string } | AsyncThunkAction<any, any, any>>,
  state: RootState
) => {
  const actions: Actions = {
    ADVANCED_CALCULATION: ({ locators, time }) => {
      dispatch(
        rerunGeneration({
          generationData: locators,
          maxGenerationTime: time,
        })
      );
    },
    COPY_LOCATOR: ({ value, option }) => {
      copyLocator(value, option)();
    },
    ELEMENT_SELECT: (payload) => {
      dispatch(elementSetActive(payload.element_id));
    },
    ELEMENT_SET_ACTIVE: (payload) => {
      dispatch(elementSetActive(selectLocatorByJdnHash(state, payload)!.element_id));
    },
    ELEMENT_GROUP_SET_ACTIVE: (payload) => {
      const locators = payload.map((jdnHash: string) => selectLocatorByJdnHash(state, jdnHash));
      dispatch(elementGroupSetActive({ locators, fromScript: true }));
      dispatch(setScrollToLocator(locators[0].element_id));
    },
    ELEMENT_GROUP_UNSET_ACTIVE: (payload) => {
      const locators = payload.map((jdnHash: string) => selectLocatorByJdnHash(state, jdnHash)) as Locator[];
      dispatch(elementGroupUnsetActive({ locators, fromScript: true }));
    },
    GET_ACTIVE_ELEMENTS: (_, sender, sendResponse) => {
      const elements = selectActiveLocators(state);
      sendResponse({
        elements,
      });
    },
    INVALID_LOCATOR: (payload) => {
      const { element_id, numberOfNodes } = payload;
      const message = !numberOfNodes?.length
        ? LocatorValidationWarnings.NotFound
        : (`${numberOfNodes} ${LocatorValidationErrors.MultipleElements}` as Locator["message"]);
      dispatch(setValidity({ element_id, message }));
    },
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeletedGroup(payload)),
    RESTORE_ELEMENT: (payload) => dispatch(toggleDeletedGroup(payload)),
    OPEN_EDIT_LOCATOR: () => {
      // handled in Locator
    },
    RERUN_GENERATION: (payload) => {
      dispatch(rerunGeneration({ generationData: payload }));
    },
    SET_JDN_HASH: (payload) => {
      dispatch(setJdnHash(payload));
    },
    START_COLLECT_DATA: showOverlay,
    /* eslint-disable */
    // @ts-ignore
    STOP_GROUP_GENERATION: (payload) => dispatch(stopGenerationGroup(payload)),
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload[0]));
      dispatch(setScrollToLocator(payload[0].element_id));
    },
    TOGGLE_ELEMENT_GROUP: (payload) => {
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
