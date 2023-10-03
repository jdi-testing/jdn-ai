import './icon128.png';
import { ScriptMsg } from './pageServices/scriptMsg.constants';

window.onload = () => {
  chrome.devtools.panels.create('JDN', 'icon128.png', 'app.html');
};

window.onbeforeunload = () => {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.tabs.sendMessage(tabId, {
    message: ScriptMsg.SetClosedSession,
    param: { tabId, isClosed: true },
  });
};
