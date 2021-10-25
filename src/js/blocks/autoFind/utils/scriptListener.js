import { sortBy } from "lodash";
import { clearAll, toggleElementGeneration } from "../redux/predictionSlice";
import { connector, sendMessage } from "./connector";
import { getJdiClassName, JDIclasses } from "./generationClassesMap";
import { onStartCollectData, openSettingsMenu } from "./pageDataHandlers";

export const createListeners = (dispatch, state) => {
  const actions = {
    TOGGLE_ELEMENT: (payload) => {
      dispatch(toggleElementGeneration(payload));
    },
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
    OPEN_XPATH_CONFIG: (ids) => openSettingsMenu(xpathConfig, ids),
    START_COLLECT_DATA: onStartCollectData,
  };

  const messageHandler = ({ message, param }, _actions) => {
    if (_actions[message]) {
      _actions[message](param);
    }
  };

  connector.updateMessageListener((payload) =>
    messageHandler(payload, actions)
  );
};

