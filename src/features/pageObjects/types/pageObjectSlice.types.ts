import { ElementId } from '../../locators/types/locator.types';
import { ElementLibrary } from '../../locators/types/generationClasses.types';
import { FrameworkType, LocatorType, AnnotationType } from '../../../common/types/common';

export type PageObjectId = number;

export interface PageObjectState {
  currentPageObject?: PageObjectId;
}

export interface PageObject {
  hideUnadded?: boolean; // whether to show in list Locators with "isGenerated" set to false
  id: PageObjectId;
  framework: FrameworkType;
  library: ElementLibrary;
  locators?: ElementId[];
  annotationType?: AnnotationType;
  locatorType: LocatorType;
  name: string;
  origin: string;
  pathname: string;
  pageData: string;
  search: string;
  url: string;
}
