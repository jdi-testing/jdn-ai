import { connector, sendMessage } from "./connector";
import { getGenerationAttributes } from "./../contentScripts/generationData";
import { getPageData } from "./../contentScripts/pageData";
import { createLocatorNames } from "./pageObject";
import { reportPopup } from "../contentScripts/popups";
import { REPORT_PROBLEM, request } from "../services/backend";
import { confirmPopup } from "../contentScripts/popups/confirmPopup";
import { createOverlay } from "../contentScripts/createOverlay";
/* global chrome*/

let overlayID;
let pageAccessTimeout;
export let pageData;

export const showOverlay = () => {
  connector.attachContentScript(createOverlay).then((data) => {
    const _overlayID = data[0].result;
    clearTimeout(pageAccessTimeout);
    overlayID = _overlayID;
  });
};

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

const uploadElements = async (result, enpoint) => {
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
      .then((data) => {
        const {result} = data[0];
        pageData = result[0];
        return uploadElements(result, endpoint);
      })
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

export const sendProblemReport = (payload) => {
  request.post(REPORT_PROBLEM, JSON.stringify(payload));
};

export const reportProblem = () => {
  connector.attachContentScript(reportPopup);
};

export const openConfirmBackPopup = (enableSave) => {
  const config = {
    header: "You have unsaved changes",
    content: "The list has been edited and the changes have not been accepted, do you want to save them?",
    buttonConfirmText: "Discard",
    buttonConfirmClass: "jdn-popup__button_warning",
    scriptMessage: "CONFIRM_BACK_POPUP",
  };
  if (enableSave) {
    config.altButtonText = "Save";
    config.altScriptMessage = "CONFIRM_SAVE_CHANGES";
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

export const openDeleteAllPopup = () => {
  const config = {
    header: "Delete all",
    content: `All page objects and packages will be cleared and you can lose all your data. 
    You cannot undo this action.`,
    buttonConfirmText: "Delete all",
    buttonConfirmClass: "jdn-popup__button_warning",
    scriptMessage: "DELETE_ALL_PAGE_OBJECTS",
  };
  chrome.storage.sync.set({POPUP_CONFIG: config}, connector.attachContentScript(confirmPopup));
};
