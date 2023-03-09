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

export interface LocatorsState {
  generationStatus: LocatorsGenerationStatus;
  status: IdentificationStatus;
  scrollToLocator: null | string;
}

export type ElementId = string;

export interface LocatorValue {
  customXpath?: string;
  fullXpath: string;
  robulaXpath?: string;
  taskStatus?: LocatorTaskStatus;
  errorMessage: string;
}

export interface Validity {
  locator: string;
}

export interface Locator extends PredictedEntity {
  children?: string[];
  deleted?: boolean;
  elemId?: string;
  elemName?: string;
  elemText?: string;
  generate: boolean;
  jdnHash: string;
  locator: LocatorValue;
  name: string;
  active?: boolean;
  isCustomName?: boolean;
  isCustomLocator?: boolean;
  pageObj: PageObjectId;
  parent_id: string;
  priority?: LocatorCalculationPriority;
  type: ElementClass;
  validity?: Validity;
}

export interface PredictedEntity {
  element_id: ElementId;
  predicted_label: string;
}

export enum ValidationErrorType {
  DuplicatedName = "This name already exists in the page object.",
  DuplicatedPageObjName = "This name already exists.",
  DuplicatedLocator = "The locator for this element already exists.", // warn
  InvalidName = "This name is not valid.",
  InvalidJavaClass = "This is not a valid Java class name.",
  EmptyValue = "Please fill out this field.",
  LongName = "Max name length is 60 characters.",
  MultipleElements = "elements were found with this locator", // warn
  NewElement = "The locator leads to the new element.", // success
  NotFound = "The locator was not found on the page.", // warn
}

export interface LocatorMenuRef {
  current?: {
    [key: string]: HTMLButtonElement | null;
  };
}
