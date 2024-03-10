/* eslint-disable @typescript-eslint/no-floating-promises */
import connector, { sendMessage } from './connector';
import { HttpEndpoint, request } from '../services/backend';
import { createOverlay } from './contentScripts/createOverlay';
import { getFullDocument } from '../common/utils/getFullDocument';
import { PredictedEntity } from '../features/locators/types/locator.types';
import { getLibrarySelectors } from '../services/rules/createSelector';
import { VueRules } from '../services/rules/Vue.rules';
// /* global chrome */

let overlayID: string;

export const showOverlay = () => {
  connector.attachContentScript(createOverlay).then((data) => {
    overlayID = data[0].result;
  });
};

export const removeOverlay = () => {
  if (overlayID) {
    chrome.storage.sync.set({ overlayID });

    connector.attachContentScript(() => {
      chrome.storage.sync.get(['overlayID'], ({ id }) => {
        const overlay = document.getElementById(id);
        if (overlay) overlay.remove();
      });
    });
  }
};

const sendToModel = async (payload: any, endpoint: HttpEndpoint) => {
  const response = await request.post(endpoint, payload);
  return response;
};

type PredictElementsType = Promise<{ data?: PredictedEntity[]; pageData?: string; error?: string }>;

/* First, plugin collects necessary data from the page.
And then tha data is sent to endpoint, according to selected library.
Function returns predicted elements. */

export const predictElements = (endpoint: HttpEndpoint): PredictElementsType => {
  let pageData: string;

  return Promise.all([sendMessage.getPageData(), getFullDocument()])
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
        return { error: error.message };
      },
    );
};

export const setParents = async (elements: any) => {
  return sendMessage.assignParents(elements).then((response) => response);
};

/* Runs elements identification based on algorithmic rules */
export const findByRules = async (): PredictElementsType => {
  const selectors = getLibrarySelectors(VueRules);
  return sendMessage
    .findBySelectors(selectors)
    .then((result) => ({ data: result, pageData: '' }))
    .catch((error) => ({ error: error.message }));
};
