import "./icon128.png";

window.onload = () => {
  /* global chrome */
  /* eslint no-undef: "error" */
  chrome.devtools.panels.create("JDN", "icon128.png", "panel.html");
};

window.onbeforeunload = clearTabSession;

function clearTabSession() {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.tabs.sendMessage(
      tabId,
      {
        message: "SET_CLOSED_SESSION",
        param: { tabId, isClosed: true }
      },
  );
}
