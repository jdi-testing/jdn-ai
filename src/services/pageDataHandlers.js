import { connector, sendMessage } from "./connector";
import { getGenerationAttributes } from "./../contentScripts/generationData";
import { getPageData } from "./../contentScripts/pageData";
import { createLocatorNames } from "./pageObject";
import { reportPopup, settingsPopup } from "../contentScripts/popups";
import { request } from "../services/backend";
import { confirmPopup } from "../contentScripts/popups/confirmPopup";
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

const uploadElements = async ([{ result }], enpoint) => {
  const payload = result[0];
  const r = await request.post(
      enpoint,
      payload
  );

  return r;
};

export const getElements = (endpoint) => {
  pageAccessTimeout = setTimeout(() => {
    console.log('Script is blocked. Close all popups');
  }, 5000);

  return connector.attachContentScript(getPageData)
      .then((data) => uploadElements(data, endpoint))
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
  return { generationData };
};

export const reportProblem = (predictedElements) => {
  chrome.storage.sync.set({ predictedElements }, connector.attachContentScript(reportPopup));
};

export const openSettingsMenu = (xpathConfig, elementIds, hasGeneratedSelected) => {
  chrome.storage.sync.set({ XPATH_CONFIG: {xpathConfig, elementIds, hasGeneratedSelected} },
      connector.attachContentScript(settingsPopup));
};

export const openConfirmBackPopup = () => {
  const config = {
    header: "Go back to the previous page?",
    content: "Your generation process will be cleared. You haven't selected any locators for this page object.",
    buttonConfirmText: "Go to the previous page",
    scriptMessage: "CONFIRM_BACK_POPUP",
  };
  chrome.storage.sync.set({POPUP_CONFIG: config}, connector.attachContentScript(confirmPopup));
};

export const openConfirmInProgressPopup = () => {
  const config = {
    header: "Сonfirm the selection",
    content: `<strong class="jdn-confirm-popup__warning">Attention!</strong> 
    Not all of the selected locators have already been generated. 
    We recommend waiting until the generation is complete.`,
    buttonConfirmText: "Сonfirm the selection",
    scriptMessage: "CONFIRM_IN_PROGRESS_POPUP",
  };
  chrome.storage.sync.set({POPUP_CONFIG: config}, connector.attachContentScript(confirmPopup));
};
