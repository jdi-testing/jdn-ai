import {
  toggleDeleted,
  toggleElementGeneration,
  clearCmElementHighlight,
  addCmElementHighlight,
  setScrollToLocator,
} from "../store/slices/locatorsSlice";
import { connector } from "./connector";
import { ElementLibrary, getTypesMenuOptions } from "../components/PageObjects/utils/generationClassesMap";
import { showOverlay } from "./pageDataHandlers";
import { selectLocatorById } from "../store/selectors/locatorSelectors";
import { stopGeneration } from "../store/thunks/stopGeneration";
import { rerunGeneration } from "../store/thunks/rerunGeneration";
import { setScriptMessage } from "../store/slices/mainSlice";
import { selectLocatorByJdnHash, selectPageObjById } from "../store/selectors/pageObjectSelectors";
import { Dispatch } from "react";
import { RootState } from "../store/store";
import { isNil } from "lodash";
import { AsyncThunkAction } from "@reduxjs/toolkit";

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
        !isNil(state.pageObject.currentPageObject) &&
        selectPageObjById(state, state.pageObject.currentPageObject)!.library;
      sendResponse({
        element,
        types: getTypesMenuOptions(library || ElementLibrary.MUI),
      });
    },
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
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
      (
          payload: ScriptMessagePayload,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response: any) => void
      ) => messageHandler(payload, sender, sendResponse, actions)
  );
};
