import { LocatorType } from "../../../common/types/common";
import { LocatorValue } from "../types/locator.types";

export const getPrioritizedXPaths = (locatorValue: LocatorValue): string[] => [
  ...(locatorValue.customXpath || typeof locatorValue.customXpath === "string" ? [locatorValue.customXpath] : []),
  ...(locatorValue.robulaXpath ? [locatorValue.robulaXpath] : []),
  locatorValue.fullXpath,
];

export const getXPathByPriority = (locatorValue: LocatorValue) => getPrioritizedXPaths(locatorValue)[0] || "";

export const getLocator = (locatorValue: LocatorValue, locatorType?: LocatorType) => {
  if (locatorType !== LocatorType.cssSelector) return getXPathByPriority(locatorValue);
  return locatorValue.cssSelector;
};

export const getCssSelector = (locatorValue: LocatorValue) => {
  return locatorValue.cssSelector;
};
