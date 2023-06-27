import { LocatorTaskStatus, Locator } from "../types/locator.types";
import { ElementClass } from "../types/generationClasses.types";

export const PLUGIN_HEADER_HEIGHT = 169;

export const DEFAULT_BREADCRUMBS_HEIGHT = 23;

export enum LocatorOption {
  Xpath = "xPath",
  XpathAndSelenium = "xPath + FindBy",
  XpathAndJDI = "xPath + JDI annotation",
  CSSSelector = "CSS selector",
  CSSAndSelenium = "CSS Selector + FindBy",
  CSSAndJDI = "CSS Selector + JDI Annotation",
  FullCode = "Full code",
}

export const newLocatorStub: Locator = {
  elemAriaLabel: "",
  elemId: "",
  elemName: "",
  elemText: "",
  element_id: "",
  jdnHash: "",
  parent_id: "",
  locator: {
    xPath: "",
    cssSelector: "",
    taskStatus: LocatorTaskStatus.SUCCESS,
  },
  name: "",
  message: "",
  pageObj: 0,
  predicted_label: "",
  isCustomName: true,
  isCustomLocator: true,
  type: "" as ElementClass,
  generate: true,
};

export const NO_ELEMENT_IN_DOCUMENT = "Document does not contain given element!";
export const NETWORK_ERROR = "Network Error has been encountered.";
export const DEFAULT_ERROR = "An error has been encountered.";
