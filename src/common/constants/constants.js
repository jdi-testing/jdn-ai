export const readmeLinkAddress = "https://github.com/jdi-testing/jdn-ai#readme";

export const locatorProgressStatus = {
  PENDING: "PENDING",
  STARTED: "STARTED",
};

export const locatorTaskStatus = {
  FAILURE: "FAILURE",
  RECEIVED: "RECEIVED",
  REVOKED: "REVOKED",
  RETRY: "RETRY",
  SUCCESS: "SUCCESS",
  ...locatorProgressStatus,
};

export const VALIDATION_ERROR_TYPE = {
  DUPLICATED_NAME: "DUPLICATED_NAME",
  DUPLICATED_LOCATOR: "DUPLICATED_LOCATOR", // warn
  INVALID_NAME: "INVALID_NAME",
  EMPTY_VALUE: "EMPTY_VALUE",
  MULTIPLE_ELEMENTS: "MULTIPLE_ELEMENTS", // warn
  NEW_ELEMENT: "NEW_ELEMENT", // success
  NOT_FOUND: "NOT_FOUND", // warn
};

export const copyTitle = {
  Copy: "Copy",
  Copied: "Copied",
};

export const SCRIPT_ERROR = {
  NO_RESPONSE: "The message port closed before a response was received.",
  NO_CONNECTION: "Could not establish connection. Receiving end does not exist.",
};

export const LOCATOR_CALCULATION_PRIORITY = {
  INCREASED: "INCREASED",
  DECREASED: "DECREASED",
};
