import { connector, sendMessage } from "./connector";
import { runContextMenu } from "./../contentScripts/contextMenu/contextmenu";
import { getGenerationAttributes } from "./../contentScripts/generationData";
import { highlightOnPage } from "./../contentScripts/highlight";
import { getPageData } from "./../contentScripts/pageData";
import { urlListener } from "./../contentScripts/urlListener";
import { createLocatorNames, getPage, predictedToConvert } from "./pageObject";
import { autoFindStatus } from "./../autoFindProvider/AutoFindProvider";
import { highlightOrder } from "./../contentScripts/highlightOrder";
import { reportProblemPopup } from "../contentScripts/reportProblemPopup/reportProblemPopup";
import { MUI_PREDICT, request } from "./backend";
import { locatorGenerationController } from "./locatorGenerationController";
/* global chrome*/

let documentListenersStarted;
let overlayID;

const removeOverlay = () => {
  if (overlayID) {
    chrome.storage.sync.set({ overlayID });

    connector.attachContentScript(() => {
      chrome.storage.sync.get(["overlayID"], ({ overlayID }) => {
        document.getElementById(overlayID).remove();
      });
    });
  }
};

const clearState = () => {
  documentListenersStarted = false;
  removeOverlay();
};

const uploadElements = async ([{ result }]) => {
  const [payload, length] = result;
  const r = await request.post(
      MUI_PREDICT,
      payload
  );

  return [r, length];
};

const setUrlListener = (onHighlightOff) => {
  connector.onTabUpdate(() => {
    clearState();
    onHighlightOff();
  });

  connector.attachContentScript(urlListener);
};

export const getElements = (callback, setStatus) => {
  const pageAccessTimeout = setTimeout(() => {
    setStatus(autoFindStatus.blocked);
  }, 5000);

  connector.updateMessageListener((payload) => {
    if (payload.message === "START_COLLECT_DATA") {
      clearTimeout(pageAccessTimeout);
      overlayID = payload.param.overlayID;
    }
  });

  return connector.attachContentScript(getPageData)
      .then(uploadElements)
      .then((data) => {
        removeOverlay();
        callback(data);
      });
};

export const highlightElements = (elements, successCallback, perception) => {
  const setHighlight = () => {
    sendMessage.setHighlight({ elements, perception });
    successCallback();
  };

  connector.attachContentScript(highlightOnPage).then(() =>
    connector.createPort().then(setHighlight)
  );
};

const messageHandler = ({ message, param }, actions) => {
  if (actions[message]) {
    actions[message](param);
  }
};

const requestGenerationAttributes = async (elements) => {
  await connector.attachContentScript(getGenerationAttributes);

  return new Promise((resolve) => {
    sendMessage.generateAttributes(elements, (response) => {
      if (chrome.runtime.lastError) {
        resolve(false);
      }
      if (response) {
        resolve(response);
      } else resolve(false);
    });
  });
};

export const runDocumentListeners = (actions) => {
  connector.updateMessageListener((payload) =>
    messageHandler(payload, actions)
  );

  if (!documentListenersStarted) {
    setUrlListener(actions["HIGHLIGHT_OFF"]);
    connector.attachContentScript(runContextMenu);
    connector.attachContentScript(highlightOrder);
    documentListenersStarted = true;
  }
};

export const requestGenerationData = async (elements, xpathConfig, callback) => {
  const generationTags = await requestGenerationAttributes(elements);
  const generationData = createLocatorNames(generationTags);
  callback({ generationData, unreachableNodes: [] });
};

export const generatePageObject = (elements, mainModel) => {
  const elToConvert = predictedToConvert(elements);
  getPage(elToConvert, (page) => {
    mainModel.conversionModel.genPageCode(page, mainModel, true);
    mainModel.conversionModel.downloadPageCode(page, ".java");
  });
};

export const reportProblem = (predictedElements) => {
  chrome.storage.sync.set({ predictedElements }, connector.attachContentScript(reportProblemPopup));
};

export const runGenerationHandler = async (elements, settings, elementCallback) => {
  const documentResult = await connector.attachContentScript(
      (() => JSON.stringify(document.documentElement.innerHTML))
  );
  const document = await documentResult[0].result;

  elements.forEach((element) => {
    const callback = (elementId, locator) => {
      elementCallback({...element, locator: { ...element.locator, ...locator}});
    };
    locatorGenerationController.scheduleTask(element.element_id, settings, document, callback);
  });
};

export const stopGenerationHandler = (element) => {
  locatorGenerationController.revokeTask(element.element_id);
};
