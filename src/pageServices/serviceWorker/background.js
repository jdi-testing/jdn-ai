chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'fetchCSS') {
    fetch(request.url, { method: 'GET' })
      .then((response) => response.text())
      .then((text) => sendResponse({ css: text }))
      .catch((error) => console.error('Ошибка загрузки CSS:', error));
    return true;
  }
});
