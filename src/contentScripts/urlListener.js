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
    if (message === "PING_SCRIPT" && param.scriptName === "urlListener") {
      sendResponse({ message: true });
    } else if (message === "CHECK_SESSION") {
      isClosedSession || sendResponse({ tabId });
    } else if (message === "DEFINE_TAB_ID") {
      tabId = param;
    } else if (message === "SET_CLOSED_SESSION" && param.tabId === tabId) {
      isClosedSession = param.isClosed;
    }
  };

  chrome.runtime.onMessage.addListener(messageHandler);
};
