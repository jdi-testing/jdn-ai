import { sortBy } from "lodash";
import {
  changeElementName,
  changeType,
  clearAll,
  setUnactualPrediction,
  toggleDeleted,
  toggleElementGeneration,
} from "../redux/predictionSlice";
import { connector, sendMessage } from "./connector";
import { getJdiClassName, JDIclasses } from "./generationClassesMap";
import { onStartCollectData, openSettingsMenu } from "./pageDataHandlers";

export const createListeners = (dispatch, state) => {
  const actions = {
    CHANGE_ELEMENT_NAME: (payload) => dispatch(changeElementName(payload)),
    CHANGE_ELEMENT_SETTINGS: (payload) => {},
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
    OPEN_XPATH_CONFIG: (payload) => openSettingsMenu(xpathConfig, payload),
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
