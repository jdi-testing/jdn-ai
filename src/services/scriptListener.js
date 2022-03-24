import {
  toggleDeleted,
  toggleElementGeneration,
  clearCmElementHighlight,
  addCmElementHighlight,
  changeLocatorAttributes,
  removeAll as removeAllLocators,
} from "../store/slices/locatorsSlice";
import { connector, sendMessage } from "./connector";
import { getTypesMenuOptions } from "../utils/generationClassesMap";
import { showOverlay } from "./pageDataHandlers";
import { selectLocatorById, selectLocators } from "../store/selectors/locatorSelectors";
import { stopGeneration } from "../store/thunks/stopGeneration";
import { rerunGeneration } from "../store/thunks/rerunGeneration";
import { isNameUnique, isPONameUnique, isStringMatchesReservedWord } from "./pageObject";
import { VALIDATION_ERROR_TYPE } from "../utils/constants";
import { clearAll, setScriptMessage, setUnactualPrediction, toggleBackdrop } from "../store/slices/mainSlice";
import { changeName as changePageObjectName, removeAll as removeAllPageObjects } from "../store/slices/pageObjectSlice";
import { selectLocatorByJdnHash, selectPageObjects } from "../store/selectors/pageObjectSelectors";

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
              stopGenerationHandler(locator.element_id);
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
    CHECK_LOCATOR_VALIDITY: ({ newElementId }, sender, sendResponse) => {
      const validationMessage = selectLocatorById(state, newElementId) ? VALIDATION_ERROR_TYPE.DUPLICATED_LOCATOR : "";
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
    DELETE_ALL_PAGE_OBJECTS: () => {
      dispatch(removeAllPageObjects());
      dispatch(removeAllLocators());
      dispatch(toggleBackdrop(false));
    },
    GET_ELEMENT: (jdnHash) => {
      const element = selectLocatorByJdnHash(state, jdnHash);
      sendMessage.elementData({
        element,
        types: getTypesMenuOptions(),
      });
    },
    HIGHLIGHT_OFF: () => {
      dispatch(clearAll());
    },
    IS_OPEN_MODAL: (payload) => dispatch(toggleBackdrop(payload)),
    PREDICTION_IS_UNACTUAL: () => dispatch(setUnactualPrediction(true)),
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    RERUN_GENERATION: (payload) => dispatch(rerunGeneration([selectLocatorById(state, payload)])),
    START_COLLECT_DATA: showOverlay,
    STOP_GENERATION: (payload) => dispatch(stopGeneration(payload)),
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload));
    },
    UPDATE_LOCATOR: (payload) => {
      dispatch(changeLocatorAttributes(payload));
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
