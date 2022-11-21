import { AsyncThunkAction } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { Dispatch } from "react";
import { setScriptMessage } from "../app/mainSlice";
import { RootState } from "../app/store";
import { rerunGeneration } from "../common/thunks/rerunGeneration";
import { stopGeneration } from "../common/thunks/stopGeneration";
import { selectLocatorById } from "../features/locators/locatorSelectors";
import {
  addCmElementHighlight, clearCmElementHighlight, setScrollToLocator, toggleDeleted,
  toggleElementGeneration
} from "../features/locators/locatorsSlice";
import { selectLocatorByJdnHash, selectPageObjById } from "../features/pageObjects/pageObjectSelectors";
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
    CM_ELEMENT_HIGHLIGHT_ON: (payload) => {
      dispatch(addCmElementHighlight(payload));
    },
    CM_ELEMENT_HIGHLIGHT_OFF: (payload) => {
      dispatch(clearCmElementHighlight(selectLocatorByJdnHash(state, payload)!.element_id));
    },
    GET_ELEMENT: (jdnHash, sender, sendResponse) => {
      const element = selectLocatorByJdnHash(state, jdnHash);
      const library =
        !isNil(state.pageObject.present.currentPageObject) &&
        selectPageObjById(state, state.pageObject.present.currentPageObject)!.library;
      sendResponse({
        element,
        types: getTypesMenuOptions(library || ElementLibrary.MUI),
      });
    },
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    RESTORE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    OPEN_EDIT_LOCATOR_REQUEST: () => {
      // handled in Locator
    },
    RERUN_GENERATION: (payload) => {
      const locator = selectLocatorById(state, payload);
      locator && dispatch(rerunGeneration({ generationData: [locator] }));
    },
    START_COLLECT_DATA: showOverlay,
    STOP_GENERATION: (payload) => dispatch(stopGeneration(payload)),
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload));
      dispatch(setScrollToLocator(payload));
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
