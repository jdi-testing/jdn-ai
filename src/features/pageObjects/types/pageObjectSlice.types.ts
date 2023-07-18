import { ElementId } from "../../locators/types/locator.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { LocatorType, AnnotationType } from "../../../common/types/common";

export type PageObjectId = number;

export interface PageObjectState {
  currentPageObject?: PageObjectId;
}

export interface PageObject {
  hideUnadded?: boolean; // whether to show in list Locators with "generate" set to false
  id: PageObjectId;
  library: ElementLibrary;
  locators?: ElementId[];
  annotationType?: AnnotationType;
  locatorType?: LocatorType;
  name: string;
  origin: string;
  pathname: string;
  pageData: string;
  search: string;
  url: string;
}
