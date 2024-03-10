console.log('backgroundScript is loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'fetchCSS') {
    fetch(request.url, {
      method: 'GET',
    })
      .then((response) => response.text())
      .then((text) => sendResponse({ data: text }))
      .catch((error) => console.error('Error fetching CSS:', error));

    return true;
  }
});
