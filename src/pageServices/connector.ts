import { isUndefined } from "lodash";
import { SCRIPT_ERROR } from "../common/constants/constants";
import { Locator, PredictedEntity } from "../features/locators/locatorSlice.types";
import { ElementClass } from "../features/pageObjects/utils/generationClassesMap";
import { assignDataLabels } from "./contentScripts/assignDataLabels";
import { runContextMenu } from "./contentScripts/contextmenu";
import { highlightOnPage } from "./contentScripts/highlight";
import { highlightOrder } from "./contentScripts/highlightOrder";
import { selectable } from "./contentScripts/selectable";
import { urlListener } from "./contentScripts/urlListener";
import { ScriptMessagePayload } from "./scriptListener";

export interface ScriptMessage {
  message: string;
  param: any;
}

/* global chrome */

/* eslint-disable */
// because we don't have proper typings for chrome object

class Connector {
  tabId: number;
  port?: chrome.runtime.Port;
  onerror: (err: Error) => void;
  onmessage: (
    payload: { message: string; param: Record<string, never> },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) => void;

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
    return (
      chrome.tabs
        .sendMessage(tabId || this.tabId, {
          message: action,
          param: payload,
        })
        // @ts-ignore
        .then((response) => response)
        .catch((error: Error) => {
          if (error.message === SCRIPT_ERROR.NO_RESPONSE && isUndefined(onResponse)) return null;
          return error;
        })
    );
  }

  // @ts-ignore
  sendMessageToAllTabs(action, payload, onResponse) {
    return chrome.tabs
      .query({})
      .then((tabs) => Promise.all(tabs.map((tab) => connector.sendMessage(action, payload, onResponse, tab.id))));
  }

  updateMessageListener(
    callback: (
      payload: ScriptMessagePayload,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => void
  ) {
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

  attachContentScript(script: (...args: any[]) => void, scriptName = "") {
    return this.scriptExists(scriptName).then((result) => {
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
      this.attachContentScript(highlightOnPage, "highlightOnPage").then(() => {
        this.createPort();
        chrome.storage.sync.set({ IS_DISCONNECTED: false });
      }),
      this.attachContentScript(runContextMenu, "runContextMenu"),
      this.attachContentScript(assignDataLabels, "assignDataLabels"),
      this.attachContentScript(highlightOrder, "highlightOrder"),
      this.attachContentScript(urlListener, "urlListener").then(() => {
        sendMessage.defineTabId(this.tabId);
        sendMessage.setClosedSession({ tabId: this.tabId, isClosed: false });
      }),
      this.attachContentScript(selectable, "selectable"),
      this.attachCSS("contentScripts.css"),
    ]);
  }

  attachCSS(file: string) {
    return chrome.scripting
      .insertCSS({
        target: { tabId: this.tabId },
        files: [file],
      })
      .catch((error) => error);
  }
}

export const connector = new Connector();

// messages, are sent from plugun to content scripts
export const sendMessage = {
  addElement: (el: Locator) => connector.sendMessage("ADD_ELEMENT", el),
  assignDataLabels: (payload: PredictedEntity[]) => connector.sendMessage("ASSIGN_DATA_LABEL", payload),
  assignParents: (payload: Locator[]) => connector.sendMessage("ASSIGN_PARENTS", payload),
  changeElementName: (el: Locator) => connector.sendMessage("CHANGE_ELEMENT_NAME", el),
  changeElementType: (el: Locator) => connector.sendMessage("CHANGE_ELEMENT_TYPE", el),
  changeStatus: (el: Locator) => connector.sendMessage("CHANGE_STATUS", el),
  checkSession: (payload: null, onResponse?: () => void): Promise<{ message: string; tabId: number }[]> =>
    connector.sendMessageToAllTabs("CHECK_SESSION", payload, onResponse),
  defineTabId: (payload: number) => connector.sendMessage("DEFINE_TAB_ID", payload),
  setClosedSession: (payload: { tabId: number; isClosed: boolean }) =>
    connector.sendMessage("SET_CLOSED_SESSION", payload),
  setHighlight: (payload: { elements?: Locator[]; perception?: number }) =>
    connector.sendMessage("SET_HIGHLIGHT", payload),
  killHighlight: (payload?: {}, onResponse?: () => void) => connector.sendMessage("KILL_HIGHLIGHT", null, onResponse),
  generateAttributes: (payload: PredictedEntity, onResponse: () => void) =>
    connector.sendMessage("GENERATE_ATTRIBUTES", payload, onResponse),
  pingScript: (payload: { scriptName: string }, onResponse?: () => void) =>
    connector.sendMessage("PING_SCRIPT", payload, onResponse),
  openEditLocator: (payload: { value: Locator; types: string[] }, onResponse?: () => void) =>
    connector.sendMessage("OPEN_EDIT_LOCATOR", payload, onResponse),
  removeElement: (payload: Locator) => connector.sendMessage("REMOVE_ELEMENT", payload),
  toggle: (payload: { element: Locator; skipScroll?: boolean }) => connector.sendMessage("HIGHLIGHT_TOGGLED", payload),
  toggleDeleted: (el: Locator) => connector.sendMessage("TOGGLE_DELETED", el),
  toggleFilter: (payload: {jdiClass: ElementClass, value: boolean}) => connector.sendMessage("TOGGLE_FILTER", payload),
  unsetActive: (payload: Locator | Locator[]) => connector.sendMessage("UNSET_ACTIVE", payload),
};

export default Connector;
