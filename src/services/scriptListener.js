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
import { getTypesMenuOptions } from "../utils/generationClassesMap";
import { pageData, sendProblemReport, showOverlay } from "./pageDataHandlers";
import { selectLocatorById, selectLocators } from "../store/selectors/locatorSelectors";
import { stopGeneration } from "../store/thunks/stopGeneration";
import { rerunGeneration } from "../store/thunks/rerunGeneration";
import { isNameUnique, isPONameUnique, isStringMatchesReservedWord } from "../components/PageObjects/utils/pageObject";
import { VALIDATION_ERROR_TYPE } from "../utils/constants";
import { clearAll, setScriptMessage, toggleBackdrop } from "../store/slices/mainSlice";
import { changeName as changePageObjectName, removeAll as removeAllPageObjects } from "../store/slices/pageObjectSlice";
import { selectLocatorByJdnHash, selectPageObjById, selectPageObjects } from "../store/selectors/pageObjectSelectors";

export const createListeners = (dispatch, state) => {
  const actions = {
    CHANGE_XPATH_SETTINGS: ({ settings, elementIds }) => {
      if (!elementIds) {
        dispatch(changeXpathSettings(settings));
      } else {
        const newPayload = elementIds.map((id) => {
          const locator = selectLocatorById(state, id);
          const elementSettings = locator.locator.settings || {};
          const newSettings = mapValues(settings, (value, key) => {
            return value === "indeterminate" ? elementSettings[key] || state.main.xpathConfig[key] : value;
          });
          if (locator.locator.taskStatus !== locatorTaskStatus.REVOKED) {
            if (isProgressStatus(locator.locator.taskStatus)) {
              stopGenerationHandler(locator.jdnHash);
            }
            const _locator = { ...locator, locator: { ...locator.locator, settings: {} } };
            _locator.locator.settings = newSettings;
            dispatch(rerunGeneration([_locator]));
          }
          return { element_id: id, locator: { ...locator.locator, settings: newSettings } };
        });
        dispatch(changeLocatorSettings(newPayload));
      }
    },
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
      dispatch(clearCmElementHighlight(selectLocatorByJdnHash(state, payload).element_id));
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
      const library = selectPageObjById(state, state.pageObject.currentPageObject).library;
      sendResponse({
        element,
        types: getTypesMenuOptions(library),
      });
    },
    GET_PAGE_DATA_JSON: (payload, sender, sendResponse) => sendResponse(pageData),
    HIGHLIGHT_OFF: () => {
      dispatch(clearAll());
    },
    IS_OPEN_MODAL: (payload) => dispatch(toggleBackdrop(payload)),
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    SEND_PROBLEM_REPORT: (payload) => sendProblemReport(payload),
    OPEN_EDIT_LOCATOR_REQUEST: (payload) => {
      dispatch(toggleBackdrop(true));
      sendMessage.openEditLocator(payload);
    },
    RERUN_GENERATION: (payload) => dispatch(rerunGeneration([selectLocatorById(state, payload)])),
    START_COLLECT_DATA: showOverlay,
    STOP_GENERATION: (payload) => dispatch(stopGeneration(payload)),
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload));
      dispatch(setScrollToLocator(payload));
    },
    UPDATE_LOCATOR: (payload) => {
      const library = selectPageObjById(state, state.pageObject.currentPageObject).library;
      dispatch(changeLocatorAttributes({ ...payload, library }));
    },
    UPDATE_PAGE_OBJECT_NAME: (payload) => {
      dispatch(changePageObjectName(payload));
    },
  };

  const messageHandler = ({ message, param }, sender, sendResponse, _actions) => {
    if (_actions[message]) {
      _actions[message](param, sender, sendResponse);
      dispatch(setScriptMessage({ message, param }));
    }
  };

  connector.updateMessageListener((payload, sender, sendResponse) =>
    messageHandler(payload, sender, sendResponse, actions)
  );
};
