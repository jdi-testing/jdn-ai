import { PageType } from "../types/mainSlice.types";

export const isLocatorListPage = (pageType: PageType) => pageType === PageType.LocatorsList;

export const isPageObjectPage = (pageType: PageType) => pageType === PageType.PageObject;