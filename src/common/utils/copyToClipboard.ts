export const copyToClipboard = (value: string | string[]) => {
  chrome.devtools.inspectedWindow.eval(`copy('${value}')`);
};
