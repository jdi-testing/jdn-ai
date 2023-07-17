import connector, { sendMessage } from "./connector";
import { request } from "../services/backend";
import { createOverlay } from "./contentScripts/createOverlay";
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

const sendToModel = async (payload, endpoint) => {
  const response = await request.post(endpoint, payload);
  return response;
};

export const predictElements = (endpoint) => {
  let pageData;
  return sendMessage
    .getPageData()
    .then((data) => {
      pageData = data[0];
      return sendToModel(pageData, endpoint);
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

export const setParents = async (elements) => {
  return sendMessage.assignParents(elements).then((response) => response);
};
