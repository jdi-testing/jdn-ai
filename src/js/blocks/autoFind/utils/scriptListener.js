import { mapValues, sortBy } from "lodash";
import {
  changeElementName,
  changeLocatorXpathSettings,
  changeType,
  changeXpathSettings,
  clearAll,
  setUnactualPrediction,
  toggleBackdrop,
  toggleDeleted,
  toggleElementGeneration,
  updateLocator,
} from "../redux/predictionSlice";
import { connector, sendMessage } from "./connector";
import { getJdiClassName, JDIclasses } from "./generationClassesMap";
import { onStartCollectData, openSettingsMenu, runGenerationHandler } from "./pageDataHandlers";

export const createListeners = (dispatch, state) => {
  const actions = {
    CHANGE_ELEMENT_NAME: (payload) => dispatch(changeElementName(payload)),
    CHANGE_XPATH_SETTINGS: ({settings, elementIds}) => {
      if (!elementIds) {
        dispatch(changeXpathSettings(settings));
      } else {
        elementIds.forEach((id) => {
          const locator = state.locators.find((el) => el.element_id === id);
          const elementSettings = locator.locator.settings || {};
          const newSettings = mapValues(settings, (value, key) => {
            return value === "indeterminate" ? elementSettings[key] || xpathConfig[key] : value;
          });
          dispatch(changeLocatorXpathSettings({id, settings: newSettings}));

          if (!locator.stopped) {
            const _locator = {...locator, locator: {...locator.locator, settings: {} }};
            _locator.locator.settings = newSettings;
            runGenerationHandler([_locator], state.xpathConfig, (el) =>
              dispatch(updateLocator(el))
            );
          }
        });
      }
    },
    CHANGE_TYPE: (payload) => dispatch(changeType(payload)),
    GET_ELEMENT: (id) => {
      const element = state.locators.find((e) => e.element_id === id);
      sendMessage.elementData({
        element,
        types: sortBy(
            Object.keys(JDIclasses).map((label) => {
              return { label, jdi: getJdiClassName(label) };
            }),
            ["jdi"]
        ),
      });
    },
    HIGHLIGHT_OFF: () => {
      dispatch(clearAll());
    },
    IS_OPEN_XPATH_CONFIG_MODAL: (payload) => dispatch(toggleBackdrop(payload)),
    OPEN_XPATH_CONFIG: (payload) => openSettingsMenu(state.xpathConfig, payload),
    PREDICTION_IS_UNACTUAL: () => dispatch(setUnactualPrediction(true)),
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    START_COLLECT_DATA: onStartCollectData,
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload));
    },
  };

  const messageHandler = ({ message, param }, _actions) => {
    if (_actions[message]) {
      _actions[message](param);
    }
  };

  connector.updateMessageListener((payload) => messageHandler(payload, actions));
};
