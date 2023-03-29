import xPathToCss from "xpath-to-css";
import { LocatorType } from "../../../common/types/locatorType";
import { LocatorValue } from "../types/locator.types";

const getLocatorByType = (xpathes: string[], locatorType?: LocatorType) => {
  if (locatorType !== LocatorType.cssSelector) return xpathes[0];

  let _index = 0;
  let cssSelector = "";

  const convertXpathToCss = () => {
    try {
      cssSelector = xPathToCss(xpathes[_index]);
    } catch (error) {
      _index++;
      if (_index < xpathes.length) convertXpathToCss();
    }
  };

  convertXpathToCss();

  return cssSelector;
};

export const getPrioritizedXpathes = (locatorValue: LocatorValue): string[] => [
  ...(locatorValue.customXpath || typeof locatorValue.customXpath === "string" ? [locatorValue.customXpath] : []),
  ...(locatorValue.robulaXpath ? [locatorValue.robulaXpath] : []),
  locatorValue.fullXpath,
];

export const getXPathByPriority = (locatorValue: LocatorValue) => getPrioritizedXpathes(locatorValue)[0] || "";

export const getLocator = (locatorValue: LocatorValue, locatorType?: LocatorType) => {
  return getLocatorByType(getPrioritizedXpathes(locatorValue), locatorType);
};
