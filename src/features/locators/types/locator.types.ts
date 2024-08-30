import { AnnotationType, ElementAttributes, LocatorType } from '../../../common/types/common';
import { PageObjectId } from '../../pageObjects/types/pageObjectSlice.types';
import { ElementClass } from './generationClasses.types';

export enum LocatorsGenerationStatus {
  noStatus = 'noStatus',
  starting = 'starting',
  started = 'started',
  failed = 'failed',
}

export enum IdentificationStatus {
  noStatus = '',
  loading = 'Loading...',
  preparing = 'Preparing locators...',
  success = 'Successful!',
  error = 'An error occurred',
  noElements = 'No elements found',
}

export type LocatorProgressStatus = LocatorTaskStatus.PENDING | LocatorTaskStatus.STARTED;

export enum LocatorTaskStatus {
  FAILURE = 'FAILURE',
  RECEIVED = 'RECEIVED',
  REVOKED = 'REVOKED',
  RETRY = 'RETRY',
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  NOT_STARTED = 'NOT_STARTED',
}

export enum LocatorElementStatus {
  DELETED = 'DELETED',
}

export enum LocatorCalculationPriority {
  Increased = 'INCREASED',
  Decreased = 'DECREASED',
}

export enum ValidationStatus {
  VALIDATING = 'validating',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface LocatorsState {
  generationStatus: LocatorsGenerationStatus;
  status: IdentificationStatus;
  scrollToLocator: null | string;
  expandedKeys: ElementId[];
  autoExpandParent: boolean;
}

export type ElementId = string;

export enum LocatorValidationErrors {
  DuplicatedName = 'This name already exists in the page object.',
  DuplicatedLocator = 'The locator for this element already exists.',
  InvalidName = 'This name is not valid.',
  MultipleElements = 'elements were found with this locator',
}

export enum LocatorValidationWarnings {
  EmptyValue = 'Please fill out this field.',
  NotFound = 'The locator was not found on the page.',
  NewElement = 'The locator leads to the new element.',
  StartsWithDigit = 'The locator cannot start with a number.',
}

export type LocatorValidationErrorType = LocatorValidationErrors | LocatorValidationWarnings | '';
export type JDNHash = string;

export interface LocatorValue {
  xPath: string | null;
  attributes: ElementAttributes;
  cssSelector: string | null;
  cssSelectorStatus: LocatorTaskStatus; // status of cssSelector calculation
  xPathStatus: LocatorTaskStatus; // status of xPath calculation
  errorMessage?: string; // comes during the locator generation
  output?: string;
  fullXpath?: string;
  originalCssSelector?: string;
}

export interface ILocator extends PredictedEntity {
  children?: ElementId[];
  deleted?: boolean;
  elemAriaLabel?: string;
  elemId?: string;
  elemName?: string;
  elemText?: string;
  isGenerated: boolean;
  isChecked: boolean;
  jdnHash: JDNHash;
  locatorValue: LocatorValue;
  name: string;
  active?: boolean;
  isCustomName?: boolean;
  isCustomLocator?: boolean;
  annotationType: AnnotationType;
  locatorType: LocatorType;
  message: LocatorValidationErrorType;
  pageObj: PageObjectId;
  parent_id: JDNHash;
  priority?: LocatorCalculationPriority;
  type: ElementClass;
}

export interface PredictedEntity {
  elementId: ElementId;
  predicted_label: string;
  is_shown: boolean;
}

export interface IPartialLocatorDataForUpdate {
  elementId?: ElementId;
  jdnHash: JDNHash;
  locatorValue: Partial<LocatorValue>;
}
