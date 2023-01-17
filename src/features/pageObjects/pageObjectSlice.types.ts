import { ElementId } from "../locators/locatorSlice.types";
import { ElementLibrary } from "./utils/generationClassesMap";

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
