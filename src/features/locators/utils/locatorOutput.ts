import xPathToCss from "xpath-to-css";
import { LocatorType } from "../../../common/types/locatorType";
import { LocatorValue } from "../types/locator.types";

const getLocatorByType = (xpath: string[], locatorType?: LocatorType) => {
  if (locatorType !== LocatorType.cssSelector) return xpath[0];

  let _index = 0;
  let cssSelector = "";

  const convertXpathToCss = () => {
    try {
      cssSelector = xPathToCss(xpath[_index]);
    } catch (error) {
      _index++;
      if (_index < xpath.length) convertXpathToCss();
    }
  };

  convertXpathToCss();

  return cssSelector;
};

const getPrioritizedXpathes = (locatorValue: LocatorValue): string[] => [
  ...(locatorValue.customXpath || typeof locatorValue.customXpath === "string" ? [locatorValue.customXpath] : []),
  ...(locatorValue.robulaXpath ? [locatorValue.robulaXpath] : []),
  locatorValue.fullXpath,
];

export const getXPathByPriority = (locatorValue: LocatorValue) => getPrioritizedXpathes(locatorValue)[0] || "";

export const getLocator = (locatorValue: LocatorValue, locatorType?: LocatorType) => {
  return getLocatorByType(getPrioritizedXpathes(locatorValue), locatorType);
};
