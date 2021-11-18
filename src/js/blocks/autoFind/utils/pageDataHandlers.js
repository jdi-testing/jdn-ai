import { connector, sendMessage } from "./connector";
import { getGenerationAttributes } from "./../contentScripts/generationData";
import { getPageData } from "./../contentScripts/pageData";
import { createLocatorNames, getPage, predictedToConvert } from "./pageObject";
import { reportPopup, settingsPopup, downloadPopup } from "../contentScripts/popups";
import { MUI_PREDICT, request } from "./backend";
import { locatorGenerationController } from "./locatorGenerationController";
/* global chrome*/

let overlayID;
let pageAccessTimeout;

export const removeOverlay = () => {
  if (overlayID) {
    chrome.storage.sync.set({ overlayID });

    connector.attachContentScript(() => {
      chrome.storage.sync.get(["overlayID"], ({ overlayID }) => {
        const overlay = document.getElementById(overlayID);
        overlay && overlay.remove();
      });
    });
  }
};

export const onStartCollectData = (payload) => {
  clearTimeout(pageAccessTimeout);
  overlayID = payload.overlayID;
};

const uploadElements = async ([{ result }]) => {
  const payload = result[0];
  const r = await request.post(
      MUI_PREDICT,
      payload
  );

  return r;
};

export const getElements = () => {
  pageAccessTimeout = setTimeout(() => {
    console.log('Script is blocked. Close all popups');
  }, 5000);

  return connector.attachContentScript(getPageData)
      .then(uploadElements)
      .then((data) => {
        removeOverlay();
        return data;
      });
};

export const highlightElements = (elements, perception) => {
  sendMessage.setHighlight({ elements, perception });
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

export const requestGenerationData = async (elements) => {
  const generationTags = await requestGenerationAttributes(elements);
  const generationData = createLocatorNames(generationTags);
  return { generationData, unreachableNodes: [] };
};

export const generatePageObject = (elements, mainModel) => {
  const elToConvert = predictedToConvert(elements);
  getPage(elToConvert, (page) => {
    mainModel.conversionModel.genPageCode(page, mainModel, true);
    mainModel.conversionModel.downloadPageCode(page, ".java");
  });
};

export const reportProblem = (predictedElements) => {
  chrome.storage.sync.set({ predictedElements }, connector.attachContentScript(reportPopup));
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
    locatorGenerationController.scheduleTask(
        element.element_id,
        element.locator.settings || settings,
        document,
        callback
    );
  });
};

export const stopGenerationHandler = (element_id) => {
  locatorGenerationController.revokeTask(element_id);
};

export const openSettingsMenu = (xpathConfig, elementIds, hasGeneratedSelected) => {
  chrome.storage.sync.set({ XPATH_CONFIG: {xpathConfig, elementIds, hasGeneratedSelected} },
      connector.attachContentScript(settingsPopup));
};

export const openDownloadPopup = () => {
  connector.attachContentScript(downloadPopup);
};
