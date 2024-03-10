console.log('style loader script is loaded');
export const fetchCSS = async (url) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        contentScriptQuery: 'fetchCSS',
        url: url,
      },
      (response) => {
        if (response.data) {
          resolve(response.data);
        } else {
          reject('Failed to load CSS');
        }
      },
    );
  });
};
