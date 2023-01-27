import { AsyncThunkAction } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { Dispatch } from "react";
import { setScriptMessage } from "../app/mainSlice";
import { RootState } from "../app/store";
import { rerunGeneration } from "../common/thunks/rerunGeneration";
import { stopGenerationGroup } from "../common/thunks/stopGenerationGroup";
import { Locator } from "../features/locators/locatorSlice.types";
import {
  elementGroupSetActive,
  elementGroupUnsetActive,
  elementSetActive,
  elementUnsetActive,
  setScrollToLocator,
  toggleDeletedGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
} from "../features/locators/locatorsSlice";
import { selectCurrentPageObject, selectLocatorByJdnHash } from "../features/pageObjects/pageObjectSelectors";
import { ElementLibrary, getTypesMenuOptions } from "../features/pageObjects/utils/generationClassesMap";
import { connector } from "./connector";
import { showOverlay } from "./pageDataHandlers";

export type ScriptMessagePayload = { message: keyof Actions; param: Record<string, never> };

type Response<T> = (payload: T, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void;

type Actions<P = any> = Record<string, Response<P>>;

export const createListeners = (
  dispatch: Dispatch<{ payload?: any; type?: string } | AsyncThunkAction<any, any, any>>,
  state: RootState
) => {
  const actions: Actions = {
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
    ELEMENT_UNSET_ACTIVE: (payload) => {
      dispatch(elementUnsetActive(selectLocatorByJdnHash(state, payload)!.element_id));
    },
    ELEMENT_GROUP_UNSET_ACTIVE: (payload) => {
      const locators = payload.map((jdnHash: string) => selectLocatorByJdnHash(state, jdnHash)) as Locator[];
      dispatch(elementGroupUnsetActive({ locators, fromScript: true }));
    },
    GET_ELEMENTS_DATA: (jdnHashes, sender, sendResponse) => {
      const elements = jdnHashes.map((jdnHash: string) => selectLocatorByJdnHash(state, jdnHash));
      const library = !isNil(state.pageObject.present.currentPageObject) && selectCurrentPageObject(state)?.library;
      sendResponse({
        elements,
        types: getTypesMenuOptions(library || ElementLibrary.MUI),
      });
    },
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeletedGroup(payload)),
    RESTORE_ELEMENT: (payload) => dispatch(toggleDeletedGroup(payload)),
    OPEN_EDIT_LOCATOR: () => {
      // handled in Locator
    },
    RERUN_GENERATION: (payload) => {
      dispatch(rerunGeneration({ generationData: payload }));
    },
    START_COLLECT_DATA: showOverlay,
    /* eslint-disable */
    // @ts-ignore
    STOP_GROUP_GENERATION: (payload) => dispatch(stopGenerationGroup(payload)),
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload[0]));
      dispatch(setScrollToLocator(payload));
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
