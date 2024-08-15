/* eslint-disable @typescript-eslint/no-floating-promises */
import connector, { sendMessage } from './connector';
import { HttpEndpoint, request } from '../services/backend';
import { createOverlay } from './contentScripts/createOverlay';
import { getFullDocumentWithStyles } from '../common/utils/getFullDocumentWithStyles';
import { ILocator, PredictedEntity } from '../features/locators/types/locator.types';
import { getLibrarySelectors } from '../services/rules/createSelector';
import { VueRules } from '../services/rules/Vue.rules';
import { getViewportResolution } from '../common/utils/getViewportResolution';
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
      chrome.storage.sync.get(['overlayID'], ({ overlayID: id }) => {
        const overlay = document.getElementById(id);
        if (overlay) overlay.remove();
      });
    });
  }
};

const sendToModel = async (payload: { elements: string; document: string }, endpoint: HttpEndpoint) => {
  const response = await request.post(endpoint, payload);
  return response;
};

type PredictElementsType = Promise<{ data?: PredictedEntity[]; pageData?: string; error?: string }>;

interface PredictEndpointData {
  element_id: string;
  predicted_label: string;
  childs: string[] | null;
  displayed: boolean;
  is_shown: boolean;
}

interface PreparedResponseData {
  elementId: string;
  predicted_label: string;
  children: string[] | null;
  displayed: boolean;
  is_shown: boolean;
}

/* First, plugin collects necessary data from the page.
And then tha data is sent to endpoint, according to selected library.
Function returns predicted elements. */

export const predictElements = (endpoint: HttpEndpoint): PredictElementsType => {
  let pageData: string;

  return Promise.all([sendMessage.getPageData(), getFullDocumentWithStyles(), getViewportResolution()])
    .then(([pageDataResult, documentResult, viewportResolution]) => {
      pageData = pageDataResult[0];

      const viewport = JSON.stringify(viewportResolution[0].result);
      const payload = { elements: pageData, document: documentResult, viewport };

      return sendToModel(payload, endpoint);
    })
    .then(
      (response: PredictEndpointData[]) => {
        removeOverlay();
        const preparedResponse: PreparedResponseData[] = response.map((item) => ({
          elementId: item.element_id,
          predicted_label: item.predicted_label,
          children: item.childs,
          displayed: item.displayed,
          is_shown: item.is_shown,
        }));
        return { data: preparedResponse, pageData };
      },
      (error) => {
        removeOverlay();
        return { error: error.response?.status ?? 500 };
      },
    );
};

export const setParents = async (elements: ILocator[]) => {
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
