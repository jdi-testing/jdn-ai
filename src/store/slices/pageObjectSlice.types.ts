import { ElementLibrary } from "../../components/PageObjects/utils/generationClassesMap";
import { ElementId } from "./locatorSlice.types";

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
}
