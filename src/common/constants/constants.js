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

export const pageType = {
  pageObject: "pageObject",
  locatorsList: "locatorsList",
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
