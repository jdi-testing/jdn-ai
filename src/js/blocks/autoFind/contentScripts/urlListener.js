export const urlListener = () => {
  window.onbeforeunload = () => {
    const highlightExists = document.querySelector("[jdn-highlight]");
    if (highlightExists) {
      return "";
    }
  };

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    if (message === "PING_SCRIPT" && param.scriptName === "urlListener") {
      sendResponse({ message: true });
    }
  };

  chrome.runtime.onMessage.addListener(messageHandler);
};
