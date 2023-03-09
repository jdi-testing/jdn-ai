import { ElementId } from "../../locators/types/locator.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";

export type PageObjectId = string;

export interface PageObjectState {
  currentPageObject?: PageObjectId;
}

export interface PageObject {
  isBaseClass?: boolean;
  extended?: PageObjectId;
  id: PageObjectId;
  library: ElementLibrary;
  locators?: ElementId[];
  name: string;
  origin: string;
  pathname: string;
  pageData: string;
  search: string;
  url: string;
}
