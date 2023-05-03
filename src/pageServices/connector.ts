import { isUndefined } from "lodash";
import { SCRIPT_ERROR } from "../common/constants/constants";
import { ElementId, Locator, PredictedEntity } from "../features/locators/types/locator.types";
import { ElementClass } from "../features/locators/types/generationClasses.types";
import { SelectorsMap } from "../services/rules/rules.types";
import { ScriptMessagePayload } from "./scriptMessageHandler";
import { ClassFilterValue } from "../features/filter/types/filter.types";

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

  async initScripts() {
    return await this.attachStaticScripts();
  }

  getTab() {
    this.tabId = chrome.devtools.inspectedWindow.tabId;
    console.log(this.tabId);
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

  updateDisconnectListener(callback: () => void) {
    const listener = (port: chrome.runtime.Port | undefined) => {
      if (this.port) this.port = undefined;
      if (typeof callback === "function") callback();
      this.initScripts();
    };

    if (this.port && !this.port.onDisconnect.hasListener(listener)) {
      this.port.onDisconnect.addListener(listener);
    }
  }

  createPort() {
    if (!this.port) {
      this.port = chrome.tabs.connect(this.tabId, {
        name: `JDN_connect_${Date.now()}`,
      });
    }
  }

  attachContentScript(script: string[] | ((...args: any[]) => void), scriptName = "") {
    return this.scriptExists(scriptName).then((result) => {
      if (result) return true;

      const injection = typeof script === "function" ? { func: script } : { files: script };

      return chrome.scripting
        .executeScript({
          target: { tabId: this.tabId },
          ...injection,
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
      this.attachContentScript(["contentScript.bundle.js"], "index").then(() => {
        this.createPort();
        chrome.storage.sync.set({ IS_DISCONNECTED: false });
        sendMessage.defineTabId(this.tabId);
        sendMessage.setClosedSession({ tabId: this.tabId, isClosed: false });
        return "success";
      }),
      this.attachCSS("contentStyles.css"),
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

const connector = new Connector();

// messages, are sent from plugin to content scripts
export const sendMessage = {
  addElement: (el: Locator) => connector.sendMessage("ADD_ELEMENT", el),
  assignDataLabels: (payload: PredictedEntity[]) => connector.sendMessage("ASSIGN_DATA_LABEL", payload),
  assignJdnHash: (payload: { jdnHash: string, locator: string | null, isCSSLocator: Boolean }) => connector.sendMessage("ASSIGN_JDN_HASH", payload),
  assignParents: (payload: Locator[]) => connector.sendMessage("ASSIGN_PARENTS", payload),
  changeElementName: (el: Locator) => connector.sendMessage("CHANGE_ELEMENT_NAME", el),
  changeElementType: (el: Locator) => connector.sendMessage("CHANGE_ELEMENT_TYPE", el),
  changeStatus: (el: Locator) => connector.sendMessage("CHANGE_STATUS", el),
  checkSession: (payload: null, onResponse?: () => void): Promise<{ message: string; tabId: number }[]> =>
    connector.sendMessageToAllTabs("CHECK_SESSION", payload, onResponse),
  defineTabId: (payload: number) => connector.sendMessage("DEFINE_TAB_ID", payload),
  evaluateXpath: (payload: { xPath: string | null; element_id?: ElementId, originJdnHash?: string }, onResponse?: () => void) =>
    connector.sendMessage("EVALUATE_XPATH", payload, onResponse),
  evaluateCssSelector: (payload: { selector: string; element_id?: ElementId, originJdnHash?: string }, onResponse?: () => void) =>
    connector.sendMessage("EVALUATE_CSS_SELECTOR", payload, onResponse),
  generateSelectorByHash: (payload: { element_id: string, jdnHash: string }, onResponse?: () => void) =>
    connector.sendMessage("GENERATE_SELECTOR_BY_HASH", payload, onResponse),
  findBySelectors: (payload: SelectorsMap) => connector.sendMessage("FIND_BY_SELECTORS", payload),
  setClosedSession: (payload: { tabId: number; isClosed: boolean }) =>
    connector.sendMessage("SET_CLOSED_SESSION", payload),
  setHighlight: (payload: { elements?: Locator[]; filter?: ClassFilterValue; isAlreadyGenerated?: boolean }) =>
    connector.sendMessage("SET_HIGHLIGHT", payload),
  killHighlight: (payload?: {}, onResponse?: () => void) => connector.sendMessage("KILL_HIGHLIGHT", null, onResponse),
  generateAttributes: (payload: PredictedEntity, onResponse: () => void) =>
    connector.sendMessage("GENERATE_ATTRIBUTES", payload, onResponse),
  getElementXpath: (payload: string, onResponse?: () => void) =>
    connector.sendMessage("GET_ELEMENT_XPATH", payload, onResponse),
  pingScript: (payload: { scriptName: string }, onResponse?: () => void) =>
    connector.sendMessage("PING_SCRIPT", payload, onResponse),
  removeElement: (payload: Locator) => connector.sendMessage("REMOVE_ELEMENT", payload),
  setActive: (payload: Locator | Locator[]) => connector.sendMessage("SET_ACTIVE", payload),
  toggle: (payload: { element: Locator; skipScroll?: boolean }) => connector.sendMessage("HIGHLIGHT_TOGGLED", payload),
  toggleDeleted: (el: Locator) => connector.sendMessage("TOGGLE_DELETED", el),
  toggleFilter: (payload: { jdiClass: ElementClass; value: boolean }) =>
    connector.sendMessage("TOGGLE_FILTER", payload),
  toggleActiveGroup: (payload: Locator[]) => connector.sendMessage("TOGGLE_ACTIVE_GROUP", payload),
  unsetActive: (payload: Locator | Locator[]) => connector.sendMessage("UNSET_ACTIVE", payload),
};

export default connector;
