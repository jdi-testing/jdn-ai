import { runContextMenu } from "../contentScripts/contextmenu";
import { editLocatorPopup } from "../contentScripts/popups/editLocatorPopup";
import { highlightOnPage } from "../contentScripts/highlight";
import { highlightOrder } from "../contentScripts/highlightOrder";
import { urlListener } from "../contentScripts/urlListener";
import { editNamePopup } from "../contentScripts/popups/editNamePopup";
import { isUndefined } from "lodash";
import { SCRIPT_ERROR } from "../utils/constants";

/* global chrome */

class Connector {
  constructor() {
    this.tabId = null;
    this.port = null;
    this.getTab();

    this.onerror = null;
  }

  handleError(error) {
    if (typeof this.onerror === "function") this.onerror(error);
    else throw error;
  }

  getTab() {
    this.tabId = chrome.devtools.inspectedWindow.tabId;
  }

  sendMessage(action, payload, onResponse, tabId) {
    return chrome.tabs
        .sendMessage(tabId || this.tabId, {
          message: action,
          param: payload,
        })
        .then((response) => response)
        .catch((error) => {
          if (error.message === SCRIPT_ERROR.NO_RESPONSE && isUndefined(onResponse)) return null;
          return error;
        });
  }

  sendMessageToAllTabs(action, payload, onResponse) {
    return chrome.tabs
        .query({})
        .then((tabs) => Promise.all(tabs.map((tab) => connector.sendMessage(action, payload, onResponse, tab.id))));
  }

  updateMessageListener(callback) {
    if (this.onmessage) chrome.runtime.onMessage.removeListener(this.onmessage);
    this.onmessage = callback;
    chrome.runtime.onMessage.addListener(this.onmessage);
  }

  onTabUpdate(callback) {
    const listener = (tabId, changeinfo) => {
      if (changeinfo && changeinfo.status === "complete" && this.tabId === tabId) {
        this.getTab();
        if (this.port) {
          this.port.disconnect();
          this.port = null;
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
    return { then: (cb) => cb(this.port) };
  }

  attachContentScript(script) {
    return this.scriptExists(script.name).then((result) => {
      if (result) return true;
      return chrome.scripting
          .executeScript({
            target: { tabId: this.tabId },
            function: script,
          })
          .then((response) => response)
          .catch((error) => error);
    });
  }

  scriptExists(scriptName) {
    if (!scriptName) return Promise.resolve(false);

    return sendMessage
        .pingScript({ scriptName })
        .then((response) => {
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

  attachCSS(file) {
    return chrome.scripting.insertCSS({
      target: { tabId: this.tabId },
      files: [file],
    }).catch((error) => error);
  }
}

export const connector = new Connector();

// messages, are sent from plugun to content scripts
export const sendMessage = {
  addElement: (el) => connector.sendMessage("ADD_ELEMENT", el),
  assignParents: (payload) => connector.sendMessage("ASSIGN_PARENTS", payload),
  changeElementName: (el) => connector.sendMessage("CHANGE_ELEMENT_NAME", el),
  changeElementType: (el) => connector.sendMessage("CHANGE_ELEMENT_TYPE", el),
  changeStatus: (el) => connector.sendMessage("CHANGE_STATUS", el),
  checkSession: (payload, onResponse) => connector.sendMessageToAllTabs("CHECK_SESSION", payload, onResponse),
  defineTabId: (payload) => connector.sendMessage("DEFINE_TAB_ID", payload),
  elementData: (payload) => connector.sendMessage("ELEMENT_DATA", payload),
  setClosedSession: (payload) => connector.sendMessage("SET_CLOSED_SESSION", payload),
  setHighlight: (payload) => connector.sendMessage("SET_HIGHLIGHT", payload),
  killHighlight: (payload, onResponse) => connector.sendMessage("KILL_HIGHLIGHT", null, onResponse),
  generateAttributes: (payload, onResponse) => connector.sendMessage("GENERATE_ATTRIBUTES", payload, onResponse),
  pingScript: (payload, onResponse) => connector.sendMessage("PING_SCRIPT", payload, onResponse),
  removeElement: (payload) => connector.sendMessage("REMOVE_ELEMENT", payload),
  toggle: (payload) => connector.sendMessage("HIGHLIGHT_TOGGLED", payload),
  toggleDeleted: (el) => connector.sendMessage("TOGGLE_DLETED", el),
};

export default Connector;
