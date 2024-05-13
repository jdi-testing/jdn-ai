import { ElementId } from '../../locators/types/locator.types';
import { ElementLibrary } from '../../locators/types/generationClasses.types';
import { AnnotationType, FrameworkType, GeneralLocatorType } from '../../../common/types/common';
import { type EntityState } from '@reduxjs/toolkit';

export type PageObjectId = number;

export interface PageObjectState extends EntityState<PageObject> {
  currentPageObject?: PageObjectId;
}

export interface PageObject {
  hideUnadded?: boolean; // whether to show in list Locators with "isGenerated" set to false
  id: PageObjectId;
  framework: FrameworkType;
  library: ElementLibrary;
  locators?: ElementId[];
  annotationType?: AnnotationType;
  locatorType: GeneralLocatorType;
  name: string;
  origin: string;
  pathname: string;
  pageData: string | null;
  search: string;
  url: string;
}
