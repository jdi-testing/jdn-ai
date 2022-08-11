import { runContextMenu } from "../contentScripts/contextmenu";
import { editLocatorPopup } from "../contentScripts/popups/editLocatorPopup";
import { highlightOnPage } from "../contentScripts/highlight";
import { highlightOrder } from "../contentScripts/highlightOrder";
import { urlListener } from "../contentScripts/urlListener";
import { editNamePopup } from "../contentScripts/popups/editNamePopup";
import { isUndefined } from "lodash";
import { SCRIPT_ERROR } from "../utils/constants";
import { Locator, PredictedEntity } from "../store/slices/locatorSlice.types";

export interface ScriptMessage {
  message: string,
  param: any,
}

/* global chrome */

/* eslint-disable */
// because we don't have proper typings for chrome object

class Connector {
  tabId: number;
  port?: chrome.runtime.Port;
  onerror: (err: Error) => void;
  onmessage: (message: any) => void;

  constructor() {
    this.getTab();
  }

  handleError(error: Error) {
    if (typeof this.onerror === "function") this.onerror(error);
    else throw error;
  }

  getTab() {
    this.tabId = chrome.devtools.inspectedWindow.tabId;
  }

  // @ts-ignore
  sendMessage(action, payload, onResponse?, tabId?): Promise<any> {
    return chrome.tabs
      .sendMessage(tabId || this.tabId, {
        message: action,
        param: payload,
      })
      // @ts-ignore
      .then((response) => response)
      .catch((error: Error) => {
        if (error.message === SCRIPT_ERROR.NO_RESPONSE && isUndefined(onResponse)) return null;
        return error;
      });
  }

  // @ts-ignore
  sendMessageToAllTabs(action, payload, onResponse) {
    return chrome.tabs
      .query({})
      .then((tabs) => Promise.all(tabs.map((tab) => connector.sendMessage(action, payload, onResponse, tab.id))));
  }

  updateMessageListener(callback: () => void) {
    if (this.onmessage) chrome.runtime.onMessage.removeListener(this.onmessage);
    this.onmessage = callback;
    chrome.runtime.onMessage.addListener(this.onmessage);
  }

  onTabUpdate(callback: () => void) {
    // @ts-ignore
    const listener = (tabId: number, changeinfo) => {
      if (changeinfo && changeinfo.status === "complete" && this.tabId === tabId) {
        this.getTab();
        if (this.port) {
          this.port.disconnect();
          this.port = undefined;
        }
        if (typeof callback === "function") callback();
      }
    };

    if (!chrome.tabs.onUpdated.hasListener(listener)) {
      chrome.tabs.onUpdated.addListener(listener);
    }
  }

  createPort() {
    if (!this.port) {
      this.port = chrome.tabs.connect(this.tabId, {
        name: `JDN_connect_${Date.now()}`,
      });
    }
    // @ts-ignore
    return { then: (cb) => cb(this.port) };
  }

  attachContentScript(script: (...args: any[]) => void) {
    return this.scriptExists(script.name).then((result) => {
      if (result) return true;
      return chrome.scripting
        .executeScript({
          target: { tabId: this.tabId },
          func: script,
        })
        .then((response) => response)
        .catch((error) => error);
    });
  }

  scriptExists(scriptName: string): Promise<string | boolean | Error> {
    if (!scriptName) return Promise.resolve(false);

    return sendMessage
      .pingScript({ scriptName })
      .then((response: ScriptMessage) => {
        if (chrome.runtime.lastError || response?.message === SCRIPT_ERROR.NO_CONNECTION) return false;
        return response?.message;
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  attachStaticScripts() {
    return Promise.all([
      this.attachContentScript(highlightOnPage).then(() => {
        this.createPort();
        chrome.storage.sync.set({ IS_DISCONNECTED: false });
      }),
      this.attachContentScript(runContextMenu),
      this.attachContentScript(editLocatorPopup),
      this.attachContentScript(editNamePopup),
      this.attachContentScript(highlightOrder),
      this.attachContentScript(urlListener).then(() => {
        sendMessage.defineTabId(this.tabId);
        sendMessage.setClosedSession({ tabId: this.tabId, isClosed: false });
      }),
      this.attachCSS("contentScripts.css"),
    ]);
  }

  attachCSS(file: string) {
    return chrome.scripting.insertCSS({
      target: { tabId: this.tabId },
      files: [file],
    }).catch((error) => error);
  }
}

export const connector = new Connector();

// messages, are sent from plugun to content scripts
export const sendMessage = {
  addElement: (el: Locator) => connector.sendMessage("ADD_ELEMENT", el),
  assignParents: (payload: Locator[]) => connector.sendMessage("ASSIGN_PARENTS", payload),
  changeElementName: (el: Locator) => connector.sendMessage("CHANGE_ELEMENT_NAME", el),
  changeElementType: (el: Locator) => connector.sendMessage("CHANGE_ELEMENT_TYPE", el),
  changeStatus: (el: Locator) => connector.sendMessage("CHANGE_STATUS", el),
  checkSession: (payload: null, onResponse: () => void) => connector.sendMessageToAllTabs("CHECK_SESSION", payload, onResponse),
  defineTabId: (payload: number) => connector.sendMessage("DEFINE_TAB_ID", payload),
  setClosedSession: (payload: { tabId: number, isClosed: boolean }) => connector.sendMessage("SET_CLOSED_SESSION", payload),
  setHighlight: (payload: { elements?: Locator[], perception?: number }) => connector.sendMessage("SET_HIGHLIGHT", payload),
  killHighlight: (payload?: {}, onResponse?: () => void) => connector.sendMessage("KILL_HIGHLIGHT", null, onResponse),
  generateAttributes: (payload: PredictedEntity, onResponse: () => void) => connector.sendMessage("GENERATE_ATTRIBUTES", payload, onResponse),
  pingScript: (payload: { scriptName: string }, onResponse?: () => void) => connector.sendMessage("PING_SCRIPT", payload, onResponse),
  removeElement: (payload: Locator) => connector.sendMessage("REMOVE_ELEMENT", payload),
  toggle: (payload: { element: Locator, skipScroll?: boolean }) => connector.sendMessage("HIGHLIGHT_TOGGLED", payload),
  toggleDeleted: (el: Locator) => connector.sendMessage("TOGGLE_DLETED", el),
};

export default Connector;
