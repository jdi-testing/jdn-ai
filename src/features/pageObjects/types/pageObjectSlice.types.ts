import { ElementId } from "../../locators/types/locator.types";
import { ElementLibrary } from "../../locators/types/generationClassesMap";

export type PageObjectId = string;

export interface PageObjectState {
  currentPageObject?: PageObjectId;
}

export interface PageObject {
  id: PageObjectId;
  library: ElementLibrary;
  locators?: ElementId[];
  name: string;
  pageData: string;
  url: string;
  pathname: string;
  origin: string;
}
