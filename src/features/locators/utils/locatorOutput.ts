import { LocatorType } from "../../../common/types/common";
import { LocatorValue } from "../types/locator.types";

export const getLocator = (locatorValue: LocatorValue, locatorType: LocatorType = LocatorType.xPath) => {
  if (locatorType !== LocatorType.cssSelector) return locatorValue.xPath;
  return locatorValue.cssSelector;
};
