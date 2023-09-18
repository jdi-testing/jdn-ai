import { isUndefined } from "lodash";
import { SCRIPT_ERROR } from "../common/constants/constants";
import { ElementId, ILocator, PredictedEntity } from "../features/locators/types/locator.types";
import { SelectorsMap } from "../services/rules/rules.types";
import { ScriptMessagePayload } from "./scriptMessageHandler";
import { ClassFilterValue } from "../features/filter/types/filter.types";
import { ScriptMsg } from "./scriptMsg.constants";

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
    payload: { message: ScriptMsg; param: Record<string, never> },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) => void;
  onDisconnectCallback: () => void;

  constructor() {
    this.getTab();
  }

  async initScripts() {
    return await this.attachStaticScripts();
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
          if (error.message === SCRIPT_ERROR.NO_CONNECTION && action !== ScriptMsg.PingScript && action !== ScriptMsg.CheckSession && action !== ScriptMsg.KillHighlight) {
            return this.onDisconnectHandler(this.port, true).then(() => this.sendMessage(action, payload, onResponse, tabId));
          }
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

  onDisconnectHandler(port: any, forced?: boolean) {
    if (this.port) this.port = undefined;
    if (typeof this.onDisconnectCallback === "function" && !forced) this.onDisconnectCallback();
    return this.initScripts().then(() => this.port?.onDisconnect.addListener(this.onDisconnectHandler.bind(this)));
  }

  updateDisconnectListener(callback: () => void) {
    this.onDisconnectCallback = callback;

    if (this.port && !this.port.onDisconnect.hasListener(this.onDisconnectHandler)) {
      this.port.onDisconnect.addListener(this.onDisconnectHandler.bind(this));
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
  addElement: (el: ILocator) => connector.sendMessage(ScriptMsg.AddElement, el),
  assignDataLabels: (payload: PredictedEntity[]) => connector.sendMessage(ScriptMsg.AssignDataLabel, payload),
  assignJdnHash: (payload: { jdnHash: string, locator: string, isCSSLocator?: Boolean }) => connector.sendMessage(ScriptMsg.AssignJdnHash, payload),
  assignParents: (payload: ILocator[]) => connector.sendMessage(ScriptMsg.AssignParents, payload),
  changeElementName: (el: ILocator) => connector.sendMessage(ScriptMsg.ChangeElementName, el),
  changeElementType: (el: ILocator) => connector.sendMessage(ScriptMsg.ChangeElementType, el),
  changeStatus: (el: ILocator) => connector.sendMessage(ScriptMsg.ChangeStatus, el),
  checkSession: (payload: null, onResponse?: () => void): Promise<{ message: string; tabId: number }[]> =>
    connector.sendMessageToAllTabs(ScriptMsg.CheckSession, payload, onResponse),
  defineTabId: (payload: number) => connector.sendMessage(ScriptMsg.DefineTabId, payload),
  evaluateXpath: (payload: { xPath: string; element_id?: ElementId, originJdnHash?: string }, onResponse?: () => void) =>
    connector.sendMessage(ScriptMsg.EvaluateXpath, payload, onResponse),
  evaluateCssSelector: (payload: { selector: string; element_id?: ElementId, originJdnHash?: string }, onResponse?: () => void) =>
    connector.sendMessage(ScriptMsg.EvaluateCssSelector, payload, onResponse),
  getPageData: (payload?: {}, onResponse?: () => void) => connector.sendMessage(ScriptMsg.GetPageData, payload, onResponse),
  generateSelectorByHash: (payload: { element_id: string, jdnHash: string }, onResponse?: () => void) =>
    connector.sendMessage(ScriptMsg.GenerateSelectorByHash, payload, onResponse),
  generateSelectorGroupByHash: (payload: { elements: ILocator[], fireCallbackMessage?: boolean }, onResponse?: () => void) =>
    connector.sendMessage(ScriptMsg.GenerateSelectorGroupByHash, payload, onResponse),
  findBySelectors: (payload: SelectorsMap) => connector.sendMessage(ScriptMsg.FindBySelectors, payload),
  setClosedSession: (payload: { tabId: number; isClosed: boolean }) =>
    connector.sendMessage(ScriptMsg.SetClosedSession, payload),
  setHighlight: (payload: { elements?: ILocator[]; filter?: ClassFilterValue; isAlreadyGenerated?: boolean }) =>
    connector.sendMessage(ScriptMsg.SetHighlight, payload),
  killHighlight: (payload?: {}, onResponse?: () => void) => connector.sendMessage(ScriptMsg.KillHighlight, null, onResponse),
  generateAttributes: (payload: { elements: PredictedEntity[], generateCss: boolean }, onResponse?: () => void) =>
    connector.sendMessage(ScriptMsg.GenerateAttributes, payload, onResponse),
  getElementXpath: (payload: string, onResponse?: () => void) =>
    connector.sendMessage(ScriptMsg.GetElementXpath, payload, onResponse),
  pingScript: (payload: { scriptName: string }, onResponse?: () => void) =>
    connector.sendMessage(ScriptMsg.PingScript, payload, onResponse),
  removeElement: (payload: ILocator) => connector.sendMessage(ScriptMsg.RemoveElement, payload),
  setActive: (payload: ILocator | ILocator[]) => connector.sendMessage(ScriptMsg.SetActive, payload),
  toggle: (payload: { element: ILocator; skipScroll?: boolean }) => connector.sendMessage(ScriptMsg.HighlightToggled, payload),
  toggleDeleted: (el: ILocator) => connector.sendMessage(ScriptMsg.ToggleDeleted, el),
  toggleFilter: (payload: ClassFilterValue) =>
    connector.sendMessage(ScriptMsg.ToggleFilter, payload),
  toggleActiveGroup: (payload: ILocator[]) => connector.sendMessage(ScriptMsg.ToggleActiveGroup, payload),
  unsetActive: (payload: ILocator | ILocator[]) => connector.sendMessage(ScriptMsg.UnsetActive, payload),
};

export default connector;
