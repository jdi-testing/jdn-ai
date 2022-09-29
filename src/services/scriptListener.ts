import {
  toggleDeleted,
  toggleElementGeneration,
  clearCmElementHighlight,
  addCmElementHighlight,
  changeLocatorAttributes,
  removeAll as removeAllLocators,
  setScrollToLocator,
} from "../store/slices/locatorsSlice";
import { connector, sendMessage } from "./connector";
import { ElementLibrary, getTypesMenuOptions } from "../components/PageObjects/utils/generationClassesMap";
import { showOverlay } from "./pageDataHandlers";
import { selectLocatorById, selectLocators } from "../store/selectors/locatorSelectors";
import { stopGeneration } from "../store/thunks/stopGeneration";
import { rerunGeneration } from "../store/thunks/rerunGeneration";
import { isNameUnique, isPONameUnique, isStringMatchesReservedWord } from "../components/PageObjects/utils/pageObject";
import { VALIDATION_ERROR_TYPE } from "../utils/constants";
import { clearAll, setScriptMessage, toggleBackdrop } from "../store/slices/mainSlice";
import { changeName as changePageObjectName, removeAll as removeAllPageObjects } from "../store/slices/pageObjectSlice";
import { selectLocatorByJdnHash, selectPageObjById, selectPageObjects } from "../store/selectors/pageObjectSelectors";
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
    CHECK_NAME_VALIDITY: ({ element_id, newName }, sender, sendResponse) => {
      if (!isNameUnique(selectLocators(state), element_id, newName)) {
        sendResponse(VALIDATION_ERROR_TYPE.DUPLICATED_NAME);
      }
      if (isStringMatchesReservedWord(newName)) sendResponse(VALIDATION_ERROR_TYPE.INVALID_NAME);
    },
    CHECK_LOCATOR_VALIDITY: ({ foundHash }, sender, sendResponse) => {
      const validationMessage = selectLocatorByJdnHash(state, foundHash) ?
        VALIDATION_ERROR_TYPE.DUPLICATED_LOCATOR :
        VALIDATION_ERROR_TYPE.NEW_ELEMENT;
      sendResponse(validationMessage);
    },
    CHECK_PO_NAME_VALIDITY: ({ id, newName }, sender, sendResponse) => {
      if (!isPONameUnique(selectPageObjects(state), id, newName)) {
        sendResponse(VALIDATION_ERROR_TYPE.DUPLICATED_NAME);
      }
      if (isStringMatchesReservedWord(newName)) sendResponse(VALIDATION_ERROR_TYPE.INVALID_NAME);
    },
    CM_ELEMENT_HIGHLIGHT_ON: (payload) => {
      dispatch(addCmElementHighlight(payload));
    },
    CM_ELEMENT_HIGHLIGHT_OFF: (payload) => {
      dispatch(clearCmElementHighlight(selectLocatorByJdnHash(state, payload)!.element_id));
    },
    CONFIRM_BACK_POPUP: () => {
      // handled in LocatorsPage
    },
    CONFIRM_IN_PROGRESS_POPUP: () => {
      // handled in LocatorsPage
    },
    CONFIRM_SAVE_CHANGES: () => {
      // handled in LocatorsPage
    },
    CONFIRM_SELECTED_POPUP: () => {
      // handled in LocatorsPage
    },
    DELETE_ALL_PAGE_OBJECTS: () => {
      dispatch(removeAllPageObjects());
      dispatch(removeAllLocators());
      dispatch(toggleBackdrop(false));
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
    HIGHLIGHT_OFF: () => {
      dispatch(clearAll());
    },
    IS_OPEN_MODAL: (payload) => dispatch(toggleBackdrop(payload)),
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
    UPDATE_LOCATOR: (payload) => {
      const library =
        !isNil(state.pageObject.currentPageObject) &&
        selectPageObjById(state, state.pageObject.currentPageObject)!.library;
      dispatch(changeLocatorAttributes({ ...payload, library }));
    },
    UPDATE_PAGE_OBJECT_NAME: (payload) => {
      dispatch(changePageObjectName(payload));
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
