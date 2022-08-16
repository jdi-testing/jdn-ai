import { connector, sendMessage } from "../../services/connector";
import { SCRIPT_ERROR } from "../../utils/constants";

export const checkSession = async (setStateCallback: (val: boolean) => void) => {
    setStateCallback(false);
    sendMessage.checkSession(null).then((payloads) => {
      payloads.forEach((payload) => {
        if (
          payload &&
          payload.message !== SCRIPT_ERROR.NO_CONNECTION &&
          payload.tabId !== connector.tabId
        ) {
            setStateCallback(true);
        }
      });
    });
  };