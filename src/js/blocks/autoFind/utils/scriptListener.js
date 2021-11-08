import { mapValues, sortBy } from "lodash";
import {
  changeElementName,
  changeLocatorXpathSettings,
  changeType,
  changeXpathSettings,
  clearAll,
  setUnactualPrediction,
  stopXpathGeneration,
  toggleBackdrop,
  toggleDeleted,
  toggleElementGeneration,
  updateLocator,
  clearCmElementHighlight,
  addCmElementHighlight,
} from "../redux/predictionSlice";
import { useAutoFind } from "../autoFindProvider/AutoFindProvider";
import { runXpathGeneration } from "../redux/thunks";
import { connector, sendMessage } from "./connector";
import { getJdiClassName, JDIclasses } from "./generationClassesMap";
import { onStartCollectData, openSettingsMenu, runGenerationHandler } from "./pageDataHandlers";
import { locatorTaskStatus } from "../utils/locatorGenerationController";

export const createListeners = (dispatch, state) => {
  const [{}, { generateAllLocators }] = useAutoFind();
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
    CM_ELEMENT_HIGHLIGHT_ON: (payload) => {
      dispatch(addCmElementHighlight(payload));
    },
    CM_ELEMENT_HIGHLIGHT_OFF: (payload) => {
      dispatch(clearCmElementHighlight(payload));
    },
    IS_OPEN_XPATH_CONFIG_MODAL: (payload) => dispatch(toggleBackdrop(payload)),
    OPEN_XPATH_CONFIG: (payload) => openSettingsMenu(state.xpathConfig, payload),
    PREDICTION_IS_UNACTUAL: () => dispatch(setUnactualPrediction(true)),
    REMOVE_ELEMENT: (payload) => dispatch(toggleDeleted(payload)),
    RERUN_GENERATION: (payload) => dispatch(runXpathGeneration([payload])),
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
    }
  };

  const messageHandler = ({ message, param }, _actions) => {
    if (_actions[message]) {
      _actions[message](param);
    }
  };

  connector.updateMessageListener((payload) => messageHandler(payload, actions));
};
