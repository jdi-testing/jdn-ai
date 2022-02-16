import { mapValues } from "lodash";

import {
  changeLocatorSettings,
  toggleDeleted,
  toggleElementGeneration,
  clearCmElementHighlight,
  addCmElementHighlight,
  changeLocatorAttributes,
  removeLocators,
} from "../store/slices/locatorsSlice";
import { connector, sendMessage } from "./connector";
import { getTypesMenuOptions } from "../utils/generationClassesMap";
import { onStartCollectData, openSettingsMenu } from "./pageDataHandlers";
import {
  selectGeneratedLocators,
  selectLocatorById,
  selectLocatorsByProbability,
  selectLocators,
} from "../store/selectors/locatorSelectors";
import { isProgressStatus, locatorGenerationController, stopGenerationHandler } from "./locatorGenerationController";
import { stopGeneration } from "../store/thunks/stopGeneration";
import { rerunGeneration } from "../store/thunks/rerunGeneration";
import { generateAllLocators, isNameUnique, isStringMatchesReservedWord } from "./pageObject";
import { locatorTaskStatus, VALIDATION_ERROR_TYPE } from "../utils/constants";
import {
  changePageBack,
  changeXpathSettings,
  clearAll,
  setUnactualPrediction,
  toggleBackdrop,
} from "../store/slices/mainSlice";
import { clearLocators } from "../store/slices/pageObjectSlice";
import { selectLocatorByJdnHash, selectPageObjById } from "../store/selectors/pageObjectSelectors";

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
    GET_ELEMENT: (id) => {
      const element = selectLocatorByJdnHash(state, id);
      sendMessage.elementData({
        element,
        types: getTypesMenuOptions(),
      });
    },
    HIGHLIGHT_OFF: () => {
      dispatch(clearAll());
    },
    CM_ELEMENT_HIGHLIGHT_ON: (payload) => {
      dispatch(addCmElementHighlight(payload));
    },
    CM_ELEMENT_HIGHLIGHT_OFF: (payload) => {
      dispatch(clearCmElementHighlight(payload));
    },
    CONFIRM_POPUP: () => {
      const currentPageObject = state.pageObject.currentPageObject;
      const locatorIds = selectPageObjById(state, currentPageObject).locators;
      locatorGenerationController.revokeAll();
      dispatch(clearLocators(currentPageObject));
      dispatch(removeLocators(locatorIds));
      dispatch(changePageBack());
      dispatch(toggleBackdrop(false));
    },
    IS_OPEN_MODAL: (payload) => dispatch(toggleBackdrop(payload)),
    OPEN_XPATH_CONFIG: (payload) => openSettingsMenu(state.main.xpathConfig, payload),
    PREDICTION_IS_UNACTUAL: () => dispatch(setUnactualPrediction(true)),
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    RERUN_GENERATION: (payload) => dispatch(rerunGeneration([selectLocatorById(state, payload)])),
    START_COLLECT_DATA: onStartCollectData,
    STOP_GENERATION: (payload) => dispatch(stopGeneration(payload)),
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload));
    },
    DOWNLOAD_POPUP: (payload) => {
      if (payload === "all") {
        generateAllLocators(selectLocatorsByProbability(state));
      } else if (payload === "generated") {
        generateAllLocators(selectGeneratedLocators(state));
      }
    },
    UPDATE_LOCATOR: (payload) => {
      dispatch(changeLocatorAttributes(payload));
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
  };

  const messageHandler = ({ message, param }, sender, sendResponse, _actions) => {
    if (_actions[message]) {
      _actions[message](param, sender, sendResponse);
    }
  };

  connector.updateMessageListener((payload, sender, sendResponse) =>
    messageHandler(payload, sender, sendResponse, actions)
  );
};
