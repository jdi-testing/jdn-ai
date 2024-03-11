/* eslint-disable @typescript-eslint/no-floating-promises */
import connector, { sendMessage } from './connector';
import { request } from '../services/backend';
import { createOverlay } from './contentScripts/createOverlay';
import { getFullDocumentWithStyles } from '../common/utils/getFullDocumentWithStyles';
// /* global chrome */

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
      chrome.storage.sync.get(['overlayID'], ({ overlayID }) => {
        const overlay = document.getElementById(overlayID);
        if (overlay) overlay.remove();
      });
    });
  }
};

const sendToModel = async (payload, endpoint) => {
  const response = await request.post(endpoint, payload);
  return response;
};

/* First, plugin collects necessary data from the page.
And then tha data is sent to endpoint, according to selected library.
Function returns predicted elements. */
export const predictElements = (endpoint) => {
  let pageData;
  return Promise.all([sendMessage.getPageData(), getFullDocumentWithStyles()])
    .then(([pageDataResult, documentResult]) => {
      pageData = pageDataResult[0];
      return sendToModel({ elements: pageData, document: documentResult }, endpoint);
    })
    .then(
      (response) => {
        removeOverlay();
        return { data: response, pageData };
      },
      (error) => {
        removeOverlay();
        return error;
      },
    );
};

export const setParents = async (elements) => {
  return sendMessage.assignParents(elements).then((response) => response);
};
