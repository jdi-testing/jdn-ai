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
      case "CHECK_SESSION":
        isClosedSession || sendResponse({ tabId });
        break;
      case "DEFINE_TAB_ID":
        tabId = param;
        break;
      case "SET_CLOSED_SESSION":
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
