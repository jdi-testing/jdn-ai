import { HttpEndpoint, request } from "../services/backend";
import { connector, sendMessage } from "../pageServices/connector";
import { SCRIPT_ERROR } from "../common/constants/constants";

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

export const getSessionId = async () => {
  const session_id = await request.get(HttpEndpoint.SESSION_ID);
  chrome.storage.sync.set({ JDN_SESSION_ID: session_id });
};
