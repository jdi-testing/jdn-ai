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
export let pageData;

export const showOverlay = () => {
  connector.attachContentScript(createOverlay).then((data) => {
    overlayID = data[0].result;
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
  const r = await request.post(enpoint, payload);

  return r;
};

export const getElements = (endpoint) =>
  connector
      .attachContentScript(getPageData)
      .then((data) => {
        const { result } = data[0];
        pageData = result[0];
        return uploadElements(result, endpoint);
      })
      .then((data) => {
        removeOverlay();
        return data;
      });

const requestGenerationAttributes = (elements) =>
  connector.attachContentScript(getGenerationAttributes).then(() =>
    sendMessage.generateAttributes(elements).then((response) => {
      if (chrome.runtime.lastError) return false;

      if (response) return response;
      else return false;
    })
  );

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
  }
  chrome.storage.sync.set({ POPUP_CONFIG: config }, connector.attachContentScript(confirmPopup));
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
  chrome.storage.sync.set({ POPUP_CONFIG: config }, connector.attachContentScript(confirmPopup));
};

export const openConfirmSelectionPopup = () => {
  const config = {
    header: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.17822 6.1875V8.375" stroke="#F18B14" stroke-width="0.875" stroke-linecap="round" 
    stroke-linejoin="round"/>
    <path d="M6.42338 2.68764L1.61088 11.0001C1.53422 11.1329 1.49379 11.2835 1.49365 11.4369C1.49352 11.5902 1.53368 
    11.7409 1.61011 11.8738C1.68654 12.0067 1.79656 12.1172 1.92915 12.1943C2.06174 12.2713 2.21224 12.3121 2.36557 
    12.3126H11.9906C12.1439 12.3121 12.2944 12.2713 12.427 12.1943C12.5596 12.1172 12.6696 12.0067 12.746 
    11.8738C12.8225 11.7409 12.8626 11.5902 12.8625 11.4369C12.8624 11.2835 12.8219 11.1329 12.7453 11.0001L7.93276 
    2.68764C7.85667 2.55468 7.7468 2.44418 7.61427 2.36732C7.48174 2.29047 7.33127 2.25 7.17807 2.25C7.02487 2.25 
    6.8744 2.29047 6.74187 2.36732C6.60935 2.44418 6.49948 2.55468 6.42338 2.68764V2.68764Z" stroke="#F18B14" 
    stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.17822 11C7.54066 11 7.83447 10.7062 7.83447 10.3438C7.83447 9.98131 7.54066 9.6875 7.17822 
    9.6875C6.81579 9.6875 6.52197 9.98131 6.52197 10.3438C6.52197 10.7062 6.81579 11 7.17822 11Z" fill="#F18B14"/>
    </svg>
    Сonfirm the selection`,
    content: `Not all selected locators will be generated.<br>
    You can cancel the generation and restore the required locators first.`,
    buttonConfirmText: "Сonfirm",
    scriptMessage: "CONFIRM_SELECTED_POPUP",
  };
  chrome.storage.sync.set({ POPUP_CONFIG: config }, connector.attachContentScript(confirmPopup));
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
  chrome.storage.sync.set({ POPUP_CONFIG: config }, connector.attachContentScript(confirmPopup));
};
