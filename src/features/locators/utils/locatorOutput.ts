import xPathToCss from "xpath-to-css";
import { LocatorType } from "../../../common/types/locatorType";
import { LocatorValue } from "../types/locator.types";

export const getLocatorByType = (xpath: string, locatorType?: LocatorType) =>
  locatorType === LocatorType.cssSelector ? xPathToCss(xpath) : xpath;

export const getXPathByPriority = ({ fullXpath, robulaXpath, customXpath }: LocatorValue) => {
  if (typeof customXpath === "string") return customXpath;
  else return robulaXpath || fullXpath || "";
};

export const getLocator = (locatorValue: LocatorValue, locatorType?: LocatorType) => {
  return getLocatorByType(getXPathByPriority(locatorValue), locatorType);
};
