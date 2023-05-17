import { ElementId } from "../../locators/types/locator.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { LocatorType } from "../../../common/types/common";

export type PageObjectId = number;

export interface PageObjectState {
  currentPageObject?: PageObjectId;
}

export interface PageObject {
  id: PageObjectId;
  library: ElementLibrary;
  locators?: ElementId[];
  locatorType?: LocatorType;
  name: string;
  origin: string;
  pathname: string;
  pageData: string;
  search: string;
  url: string;
}
