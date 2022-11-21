import { Locator } from "../../features/locators/locatorSlice.types";

export const assignDataLabels = () => {
  const assignDataLabel = (hashes: Array<Locator>) => {
    hashes.forEach(({ jdnHash, predicted_label }) => {
      const element = document.querySelector(`[jdn-hash='${jdnHash}']`);
      element?.setAttribute("data-label", predicted_label);
    });
  };

  const messageHandler = (
      { message, param }: { message: any; param: any },
      _: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
  ) => {
    if (message === "ASSIGN_DATA_LABEL") {
      assignDataLabel(param);
    }

    if (message === "PING_SCRIPT" && param.scriptName === "assignDataLabels") {
      sendResponse({ message: true });
    }
  };

  chrome.runtime.onConnect.addListener(() => {
    chrome.runtime.onMessage.addListener(messageHandler);
  });
};
