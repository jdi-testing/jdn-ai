import { mapValues } from "lodash";
import {
  changeLocatorSettings,
  changeXpathSettings,
  clearAll,
  setUnactualPrediction,
  stopXpathGeneration,
  toggleBackdrop,
  toggleDeleted,
  toggleElementGeneration,
  clearCmElementHighlight,
  addCmElementHighlight,
  changeLocatorAttributes,
} from "../redux/predictionSlice";
import { useAutoFind } from "../autoFindProvider/AutoFindProvider";
import { rerunGeneration, runXpathGeneration } from "../redux/thunks";
import { connector, sendMessage } from "./connector";
import { getTypesMenuOptions } from "./generationClassesMap";
import { onStartCollectData, openSettingsMenu } from "./pageDataHandlers";
import { locatorTaskStatus } from "../utils/locatorGenerationController";
import { selectLocatorById } from "../redux/selectors";

export const createListeners = (dispatch, state) => {
  const [{}, { generateAllLocators }] = useAutoFind();
  const actions = {
    CHANGE_XPATH_SETTINGS: ({settings, elementIds}) => {
      if (!elementIds) {
        dispatch(changeXpathSettings(settings));
      } else {
        const newPayload = elementIds.map((id) => {
          const locator = selectLocatorById(state, id);
          const elementSettings = locator.locator.settings || {};
          const newSettings = mapValues(settings, (value, key) => {
            return value === "indeterminate" ? elementSettings[key] || state.main.xpathConfig[key] : value;
          });
          if (!locator.stopped) {
            const _locator = {...locator, locator: {...locator.locator, settings: {} }};
            _locator.locator.settings = newSettings;
            dispatch(runXpathGeneration([_locator]));
          }
          return {element_id: id, locator: {...locator.locator, settings: newSettings}};
        });
        dispatch(changeLocatorSettings(newPayload));
      }
    },
    GET_ELEMENT: (id) => {
      const element = selectLocatorById(state, id);
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
    IS_OPEN_MODAL: (payload) => dispatch(toggleBackdrop(payload)),
    OPEN_XPATH_CONFIG: (payload) => openSettingsMenu(state.main.xpathConfig, payload),
    PREDICTION_IS_UNACTUAL: () => dispatch(setUnactualPrediction(true)),
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    RERUN_GENERATION: (payload) => dispatch(rerunGeneration([selectLocatorById(state, payload)])),
    START_COLLECT_DATA: onStartCollectData,
    STOP_GENERATION: (payload) => dispatch(stopXpathGeneration(payload)),
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload));
    },
    DOWNLOAD_POPUP: (payload) => {
      if (payload === 'all') {
        generateAllLocators(state.locators);
      } else if (payload === 'generated') {
        generateAllLocators(state.locators.filter((loc) => {
          return loc.locator.taskStatus === locatorTaskStatus.SUCCESS;
        }));
      }
    },
    UPDATE_LOCATOR: (payload) => dispatch(changeLocatorAttributes(payload)),
  };

  const messageHandler = ({ message, param }, _actions) => {
    if (_actions[message]) {
      _actions[message](param);
    }
  };

  connector.updateMessageListener((payload) => messageHandler(payload, actions));
};
