import { runContextMenu } from "../contentScripts/contextmenu";
import { editLocatorPopup } from "../contentScripts/popups/editLocatorPopup";
import { highlightOnPage } from "../contentScripts/highlight";
import { highlightOrder } from "../contentScripts/highlightOrder";
import { urlListener } from "../contentScripts/urlListener";

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

  sendMessage(action, payload, onResponse) {
    const callback = () => {
      chrome.tabs.sendMessage(
          this.tabId,
          {
            message: action,
            param: payload,
          },
          onResponse
      );
    };

    if (!this.tabId) {
      setTimeout(callback, 0);
    } else callback();
  }

  updateMessageListener(callback) {
    if (this.onmessage) chrome.runtime.onMessage.removeListener(this.onmessage);
    this.onmessage = callback;
    chrome.runtime.onMessage.addListener(this.onmessage);
  }

  onTabUpdate(callback) {
    const listener = (tabId, changeinfo) => {
      if (
        changeinfo &&
        changeinfo.status === "complete" &&
        this.tabId === tabId
      ) {
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
    };
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
      return new Promise((resolve) => {
        if (result) return resolve(true);
        chrome.scripting.executeScript(
            {
              target: { tabId: this.tabId },
              function: script
            },
            (invoked) => {
              resolve(invoked || true);
            }
        );
      });
    });
  }

  attachCSS(file) {
    chrome.scripting.insertCSS({
      target: { tabId: this.tabId },
      files: [file],
    });
  }

  scriptExists(scriptName) {
    return new Promise((resolve) => {
      sendMessage.pingScript({ scriptName }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
        }
        if (response && response.message) {
          resolve(true);
        } else resolve(false);
      });
    });
  }

  attachStaticScripts() {
    this.attachContentScript(highlightOnPage).then(() => {
      this.createPort();
      chrome.storage.sync.set({ IS_DISCONNECTED: false });
    });
    this.attachContentScript(runContextMenu);
    this.attachContentScript(editLocatorPopup);
    this.attachContentScript(highlightOrder);
    this.attachContentScript(urlListener);
  }
}

export const connector = new Connector();

// messages, are sent from plugun to content scripts
export const sendMessage = {
  toggle: (payload) => connector.sendMessage("HIGHLIGHT_TOGGLED", payload),
  toggleDeleted: (el) => connector.sendMessage("TOGGLE_DLETED", el),
  changeElementName: (el) => connector.sendMessage("CHANGE_ELEMENT_NAME", el),
  changeElementType: (el) => connector.sendMessage("CHANGE_ELEMENT_TYPE", el),
  changeStatus: (el) => connector.sendMessage("CHANGE_STATUS", el),
  elementData: (payload) => connector.sendMessage("ELEMENT_DATA", payload),
  setHighlight: (payload) => connector.sendMessage("SET_HIGHLIGHT", payload),
  killHighlight: (payload, onResponse) =>
    connector.sendMessage("KILL_HIGHLIGHT", null, onResponse),
  generateAttributes: (payload, onResponse) =>
    connector.sendMessage("GENERATE_ATTRIBUTES", payload, onResponse),
  pingScript: (payload, onResponse) =>
    connector.sendMessage("PING_SCRIPT", payload, onResponse),
  highlightUnreached: (payload) => connector.sendMessage("HIGHLIGHT_ERRORS", payload),
  replaceElement: (payload) => connector.sendMessage("REPLACE_ELEMENT", payload),
  removeElement: (payload) => connector.sendMessage("REMOVE_ELEMENT", payload),
};

export default Connector;
