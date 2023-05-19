import { LocatorType } from "../../../common/types/common";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementClass } from "./generationClasses.types";

export enum LocatorsGenerationStatus {
  noStatus = "noStatus",
  starting = "starting",
  started = "started",
  complete = "complete",
  failed = "failed",
}

export enum IdentificationStatus {
  noStatus = "",
  loading = "Loading...",
  preparing = "Preparing locators...",
  success = "Successful!",
  removed = "Removed",
  error = "An error occurred",
}

export type LocatorProgressStatus = LocatorTaskStatus.PENDING | LocatorTaskStatus.STARTED;

export enum LocatorTaskStatus {
  FAILURE = "FAILURE",
  RECEIVED = "RECEIVED",
  REVOKED = "REVOKED",
  RETRY = "RETRY",
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  STARTED = "STARTED",
}

export enum LocatorCalculationPriority {
  Increased = "INCREASED",
  Decreased = "DECREASED",
}

export enum ValidationStatus {
  VALIDATING = "validating",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export interface LocatorsState {
  generationStatus: LocatorsGenerationStatus;
  status: IdentificationStatus;
  scrollToLocator: null | string;
}

export type ElementId = string;

export interface LocatorValue {
  xPath: string;
  cssSelector: string;
  taskStatus?: LocatorTaskStatus;
  errorMessage?: string; // comes during the locator generation
  output?: string;
}

export enum LocatorValidationErrors {
  DuplicatedName = "This name already exists in the page object.",
  DuplicatedLocator = "The locator for this element already exists.",
  InvalidName = "This name is not valid.",
  MultipleElements = "elements were found with this locator",
}

export enum LocatorValidationWarnings {
  EmptyValue = "Please fill out this field.",
  NotFound = "The locator was not found on the page.",
  NewElement = "The locator leads to the new element.",
}

export type LocatorValidationErrorType = LocatorValidationErrors | LocatorValidationWarnings | "";
export type JDNHash = string;

export interface Locator extends PredictedEntity {
  children?: ElementId[];
  deleted?: boolean;
  elemAriaLabel?: string;
  elemId?: string;
  elemName?: string;
  elemText?: string;
  generate: boolean;
  jdnHash: JDNHash;
  locator: LocatorValue;
  name: string;
  active?: boolean;
  isCustomName?: boolean;
  isCustomLocator?: boolean;
  locatorType?: LocatorType;
  pageObj: PageObjectId;
  parent_id: JDNHash;
  priority?: LocatorCalculationPriority;
  type: ElementClass;
  message: LocatorValidationErrorType;
}

export interface PredictedEntity {
  element_id: ElementId;
  predicted_label: string;
}
