import { sendMessage } from '../../pageServices/connector';

export const floatToPercent = (value: number) => {
  // wse need to show percents, but multiply float * 100 provides an unexpected result and leads to bugs
  return Math.trunc(value * 100);
};

export const isMacPlatform = (param: Window) => param.navigator?.userAgent.indexOf('Mac') != -1;

export const findSubstringWithinTerms = (
  text: string,
  startSubstring: string,
  endSubstring: string | RegExp,
): string => {
  let startIndex = text.indexOf(startSubstring);
  if (startIndex !== -1) {
    startIndex += startSubstring.length;
    let endIndex;
    if (endSubstring instanceof RegExp) {
      endSubstring.lastIndex = startIndex;
      const match = endSubstring.exec(text.slice(startIndex));
      if (match) {
        endIndex = match.index + match[0].length + startIndex;
      }
    } else {
      endIndex = text.indexOf(endSubstring, startIndex);
    }
    if (endIndex !== -1) {
      return text.substring(text.indexOf(startSubstring), endIndex);
    }
  }
  return '';
};

export const generateId = (): string => {
  return (
    Math.random().toString().substring(2, 12) +
    Date.now().toString().substring(5) +
    Math.random().toString().substring(2, 12)
  );
};

export const getElementFullXpath = async (foundHash: string): Promise<string> => {
  let fullXpath = '';

  await sendMessage
    .getElementXpath(foundHash)
    .then((xPath: string) => {
      if (xPath) fullXpath = xPath;
    })
    .catch((err: Error) => err);

  return fullXpath;
};

export const getElementOriginalCssSelector = async (foundHash: string): Promise<string> => {
  let originalCssSelector = '';

  await sendMessage
    .getElementOriginalCssSelector(foundHash)
    .then((res: string) => {
      if (res) originalCssSelector = res;
    })
    .catch((err: Error) => err);

  return originalCssSelector;
};

export const isFilteredSelect = (input: string, option: any) =>
  (option?.value?.toString() ?? '').toLowerCase().includes(input.toLowerCase());

export const isStringContainsNumbers = (string: string) => {
  const regex = /\d/; // Regular expression to match any digit (0-9)
  return regex.test(string);
};
