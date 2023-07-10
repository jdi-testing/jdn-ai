import { ScriptMsg } from "../scriptMsg.constants";
import { assignDataLabels } from "./assignDataLabels";
import { runContextMenu } from "./contextmenu";
import { getGenerationAttributes } from "./generationData";
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
getGenerationAttributes();

const messageHandler = (
  { message, param }: { message: string; param: any },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  if (message === ScriptMsg.PingScript && param.scriptName === "index") {
    sendResponse({ message: true });
  }
};

chrome.runtime.onMessage.addListener(messageHandler);
