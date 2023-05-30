import "./icon128.png";

window.onload = () => {
  chrome.devtools.panels.create("JDN", "icon128.png", "app.html");
};

window.onbeforeunload = () => {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.tabs.sendMessage(tabId, {
    message: "SET_CLOSED_SESSION",
    param: { tabId, isClosed: true },
  });
};
