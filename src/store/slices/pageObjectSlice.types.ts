import { ElementId } from "./locatorSlice.types";

export type PageObjectId = string;

export enum ElementLibrary {
    MUI = "MUI",
    HTML5 = "HTML5",
}

export interface PageObjectState {
    currentPageObject?: PageObjectId,
}

export interface PageObject {
    id: PageObjectId,
    library?: ElementLibrary,
    locators?: ElementId[],
    name?: string,
}