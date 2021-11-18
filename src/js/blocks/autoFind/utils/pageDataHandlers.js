import { connector, sendMessage } from "./connector";
import { getGenerationAttributes } from "./../contentScripts/generationData";
import { getPageData } from "./../contentScripts/pageData";
import { createLocatorNames, getPage, predictedToConvert } from "./pageObject";
import { reportProblemPopup } from "../contentScripts/reportProblemPopup/reportProblemPopup";
import { settingsPopup } from "../contentScripts/settingsPopup/settingsPopup";
import { MUI_PREDICT, request } from "./backend";
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
  chrome.storage.sync.set({ predictedElements }, connector.attachContentScript(reportProblemPopup));
};

export const openSettingsMenu = (xpathConfig, elementIds) => {
  chrome.storage.sync.set({ XPATH_CONFIG: {xpathConfig, elementIds} }, connector.attachContentScript(settingsPopup));
};
