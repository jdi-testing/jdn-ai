import { connector, sendMessage } from "./connector";
import { runContextMenu } from "./../contentScripts/contextMenu/contextmenu";
import { getGenerationAttributes } from "./../contentScripts/generationData";
import { highlightOnPage } from "./../contentScripts/highlight";
import { getPageData } from "./../contentScripts/pageData";
import { urlListener } from "./../contentScripts/urlListener";
import { getPage, predictedToConvert } from "./pageObject";
import { autoFindStatus } from "./../autoFindProvider/AutoFindProvider";
import { highlightOrder } from "./../contentScripts/highlightOrder";
import { reportProblemPopup } from "../contentScripts/reportProblemPopup/reportProblemPopup";
import { GENERATE_XPATH, MUI_PREDICT, request } from "./backend";
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

export const requestXpathes = async (elements, config) => {
  const documentResult = await connector.attachContentScript(
      (() => JSON.stringify(document.documentElement.innerHTML))
  );

  const document = await documentResult[0].result;
  const ids = elements.map((el) => el.element_id);

  const xPathes = await request.post(
      GENERATE_XPATH,
      JSON.stringify({
        ids,
        document,
        config
      })
  );

  const r = elements.map((el) => ({ ...el, xpath: xPathes[el.element_id] }));
  const unreachableNodes = r.filter((el) => !el.xpath);
  return { xpathes: r.filter((el) => !!el.xpath), unreachableNodes };
};

export const requestGenerationData = async (elements, xpathConfig, callback) => {
  const { xpathes, unreachableNodes } = await (await requestXpathes(elements, xpathConfig));
  const generationAttributes = await requestGenerationAttributes(elements);
  const generationData = xpathes.map((el) => {
    const attr = generationAttributes.find((g) => g.element_id === el.element_id);
    return {
      ...el,
      ...attr,
    };
  });
  callback({ generationData, unreachableNodes });
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
