export const getUrlFromStorage = async (key: string, fallbackUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      console.log('Значение, полученное из storage:', result[key]);
      if (result[key]) {
        resolve(result[key]);
      } else {
        resolve(fallbackUrl);
      }
    });
  });
};
