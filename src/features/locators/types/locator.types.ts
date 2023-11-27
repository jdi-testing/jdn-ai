import { LocatorType, AnnotationType, ElementAttributes } from '../../../common/types/common';
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
}

export type ElementId = string;

export interface LocatorValue {
  fullXpath?: string;
  xPath: string;
  attributes: ElementAttributes;
  cssSelector: string;
  cssSelectorStatus?: LocatorTaskStatus; // status of cssSelector calculation
  xPathStatus?: LocatorTaskStatus; // status of xPath calculation
  taskStatus?: LocatorTaskStatus; // status of both calculations
  errorMessage?: string; // comes during the locator generation
  output?: string;
}

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
}

export type LocatorValidationErrorType = LocatorValidationErrors | LocatorValidationWarnings | '';
export type JDNHash = string;

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
  locator: LocatorValue;
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
  element_id: ElementId;
  predicted_label: string;
  is_shown: boolean;
}
