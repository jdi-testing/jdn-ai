import { LocatorTaskStatus, ILocator } from '../types/locator.types';
import { ElementClass } from '../types/generationClasses.types';
import { AnnotationType, LocatorType } from '../../../common/types/common';

export const PLUGIN_HEADER_HEIGHT = 169;

export const DEFAULT_BREADCRUMBS_HEIGHT = 23;

export enum LocatorOption {
  Xpath = 'xPath',
  XpathAndSelenium = 'xPath + FindBy',
  XpathAndJDI = 'xPath + JDI annotation',
  CSSSelector = 'CSS selector',
  CSSAndSelenium = 'CSS Selector + FindBy',
  CSSAndJDI = 'CSS Selector + JDI Annotation',
  FullCode = 'Full code',
}

export const newLocatorStub: ILocator = {
  elemAriaLabel: '',
  elemId: '',
  elemName: '',
  elemText: '',
  element_id: '',
  is_shown: true,
  jdnHash: '',
  parent_id: '',
  locator: {
    xPath: '',
    cssSelector: '',
    attributes: {},
    taskStatus: LocatorTaskStatus.SUCCESS,
  },
  annotationType: '' as AnnotationType,
  locatorType: '' as LocatorType,
  name: '',
  message: '',
  pageObj: 0,
  predicted_label: '',
  isCustomName: true,
  isCustomLocator: true,
  type: '' as ElementClass,
  isGenerated: true,
  isChecked: false,
};

export const NO_ELEMENT_IN_DOCUMENT = 'Document does not contain given element!';
export const NETWORK_ERROR = 'Network Error has been encountered.';
export const DEFAULT_ERROR = 'An error has been encountered.';

// max number of elements to start locators generation automatically
export const AUTO_GENERATION_THRESHOLD = 500;

export const CALCULATING = 'Calculating...';
