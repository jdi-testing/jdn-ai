import xPathToCss from "xpath-to-css";
import { LocatorType } from "../../../common/types/locatorType";
import { LocatorValue } from "../types/locator.types";

export const getLocatorByType = (xpath: string, locatorType?: LocatorType) =>{
  try {
    return locatorType === LocatorType.cssSelector ? xPathToCss(xpath) : xpath; 
  } catch (error) {
    debugger;
  }
}

export const getXPathbyPriority = ({ fullXpath, robulaXpath, customXpath }: LocatorValue) => {
  if (typeof customXpath === "string") return customXpath;
  else return robulaXpath || fullXpath || "";
};

export const getLocator = (locatorValue: LocatorValue, locatorType?: LocatorType) => {
  return getLocatorByType(getXPathbyPriority(locatorValue), locatorType);
};
