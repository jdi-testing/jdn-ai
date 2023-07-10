import { ScriptMsg } from "../scriptMsg.constants";

export const urlListener = () => {
  let tabId;
  let isClosedSession;

  window.onbeforeunload = () => {
    const highlightExists = document.querySelector("[jdn-highlight]");
    if (highlightExists) {
      return "";
    }
  };

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    switch (message) {
      case ScriptMsg.CheckSession:
        isClosedSession || sendResponse({ tabId });
        break;
      case ScriptMsg.DefineTabId:
        tabId = param;
        break;
      case ScriptMsg.SetClosedSession:
        if (param.tabId === tabId) {
          isClosedSession = param.isClosed;
        }
        break;
      default:
        break;
    }
  };

  chrome.runtime.onMessage.addListener(messageHandler);
};
