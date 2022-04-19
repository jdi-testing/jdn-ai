export const readmeLinkAddress = "https://github.com/jdi-testing/jdn-ai#readme";

export const identificationStatus = {
  noStatus: "",
  loading: "Loading...",
  success: "Successful!",
  removed: "Removed",
  error: "An error occured",
  blocked: "Script is blocked. Close all popups",
};

export const xpathGenerationStatus = {
  noStatus: "",
  started: "XPath generation is running in background...",
  complete: "XPathes generation is successfully completed",
};

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

export const pageType = {
  pageObject: "pageObject",
  locatorsList: "locatorsList",
};

export const copyTitle = {
  Copy: "Copy",
  Copied: "Copied",
};
