import { assignDataLabels } from "./assignDataLabels";
import { runContextMenu } from "./contextmenu";
import { highlightOnPage } from "./highlight";
import { highlightOrder } from "./highlightOrder";
import { selectable } from "./selectable";
import { urlListener } from "./urlListener";
import { utilityScript } from "./utils";

highlightOnPage();
runContextMenu();
assignDataLabels();
highlightOrder();
urlListener();
selectable();
utilityScript();

const messageHandler = (
  { message, param }: { message: string; param: any },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  if (message === "PING_SCRIPT" && param.scriptName === "index") {
    sendResponse({ message: true });
  }
};

chrome.runtime.onMessage.addListener(messageHandler);
