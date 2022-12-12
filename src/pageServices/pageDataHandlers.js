import { connector, sendMessage } from "./connector";
import { request } from "../services/backend";
import { createLocatorNames } from "../features/pageObjects/utils/pageObject";
import { createOverlay } from "./contentScripts/createOverlay";
import { assignParents } from "./contentScripts/assignParents";
import { getPageData } from "./contentScripts/pageData";
import { getGenerationAttributes } from "./contentScripts/generationData";
/* global chrome*/

let overlayID;

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

const sendToModel = async (result, enpoint) => {
  const payload = result[0];
  const response = await request.post(enpoint, payload);
  return response;
};

export const predictElements = (endpoint) => {
  let pageData;
  return connector
    .attachContentScript(getPageData)
    .then((data) => {
      const { result } = data[0];
      pageData = result[0];
      return sendToModel(result, endpoint);
    })
    .then(
      (response) => {
        removeOverlay();
        return { data: response, pageData };
      },
      (error) => {
        removeOverlay();
        return error;
      }
    );
};
const requestGenerationAttributes = (elements) =>
  connector.attachContentScript(getGenerationAttributes).then(() =>
    sendMessage.generateAttributes(elements).then((response) => {
      if (chrome.runtime.lastError) return false;

      if (response) return response;
      else return false;
    })
  );

export const requestGenerationData = async (elements, library) => {
  const generationTags = await requestGenerationAttributes(elements);
  const generationData = createLocatorNames(generationTags, library);
  return { generationData };
};

export const setParents = async (elements) => {
  return connector
    .attachContentScript(assignParents)
    .then(() => sendMessage.assignParents(elements))
    .then((response) => response);
};
