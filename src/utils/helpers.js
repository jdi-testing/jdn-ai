import { getLocator } from "../services/pageObject";

export const floatToPercent = (value) => {
  // wse need to show percents, but multiply float * 100 provides an unexpected result and leads to bugs
  return Math.trunc(value * 100);
};

export const copyToClipboard = (text) => {
  const transformedText = text.replace(/'/g, "\\'").replace(/\n/g, '\\n');
  chrome.devtools.inspectedWindow.eval(`copy('${transformedText}')`);
};

export const getLocatorString = (loc) => `@UI("${getLocator(loc.locator)}")\npublic ${loc.type} ${loc.name};`;
