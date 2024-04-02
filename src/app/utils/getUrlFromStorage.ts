export type TUrlFromStorage = string | null;
export const getUrlFromStorage = async (key: string): Promise<TUrlFromStorage> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      if (result[key]) {
        resolve(result[key]);
      } else {
        resolve(null);
      }
    });
  });
};
