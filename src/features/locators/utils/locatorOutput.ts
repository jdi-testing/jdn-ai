import xPathToCss from "xpath-to-css";
import { LocatorType } from "../../../common/types/common";
import { LocatorValue } from "../types/locator.types";

export const convertXpathToCss = (xPaths: string[]) => {
  let _index = 0;
  let cssSelector = "";

  const convertXpathToCss = () => {
    try {
      cssSelector = xPathToCss(xPaths[_index]);
    } catch (error) {
      _index++;
      if (_index < xPaths.length) convertXpathToCss();
    }
  };

  convertXpathToCss();

  return cssSelector;
};

const getLocatorByType = (xPaths: string[], locatorType?: LocatorType) => {
  if (locatorType !== LocatorType.cssSelector) return xPaths[0];

  return convertXpathToCss(xPaths);
};

export const getPrioritizedXPaths = (locatorValue: LocatorValue): string[] => [
  ...(locatorValue.customXpath || typeof locatorValue.customXpath === "string" ? [locatorValue.customXpath] : []),
  ...(locatorValue.robulaXpath ? [locatorValue.robulaXpath] : []),
  locatorValue.fullXpath,
];

export const getXPathByPriority = (locatorValue: LocatorValue) => getPrioritizedXPaths(locatorValue)[0] || "";

export const getLocator = (locatorValue: LocatorValue, locatorType?: LocatorType) => {
  return getLocatorByType(getPrioritizedXPaths(locatorValue), locatorType);
};

//looks redundant, we can use getLocator anywhere
export const getCssSelector = (locatorValue: LocatorValue) => {
  return getLocatorByType(getPrioritizedXPaths(locatorValue), LocatorType.cssSelector);
};
