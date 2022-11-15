import { ElementLabel } from "../../components/PageObjects/utils/generationClassesMap";

export enum LocatorsGenerationStatus {
  noStatus = "",
  started = "Locators generation is running in background...",
  complete = "Locators generation is successfully completed",
  failed = "Network error, check network settings or run server locally.",
}

export enum IdentificationStatus {
  noStatus = "",
  loading = "Loading...",
  success = "Successful!",
  removed = "Removed",
  error = "An error occured",
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
  isCmHighlighted?: boolean;
  isCustomName?: boolean;
  isCustomLocator?: boolean;
  parent_id: string;
  priority?: LocatorCalculationPriority;
  type: ElementLabel;
  validity?: Validity;
}

export interface PredictedEntity {
  element_id: ElementId;
  x: number;
  y: number;
  width: number;
  height: number;
  predicted_label: string;
  predicted_probability: number;
  sort_key: number;
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
