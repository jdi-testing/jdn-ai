export const messages = (value?: string) => {
  return {
    ACTION_CANCELLED: "The action was cancelled",
    DELETE: "The locator was deleted",
    DELETE_GROUP: `${value} locators were deleted`,
    DOWNLOAD_FILE: "The Java file was downloaded",
    DOWNLOAD_JS_FILE: "The JavaScript file was downloaded",
    DOWNLOAD_TEMPLATE: "The archive with template was downloaded",
    EDIT_PO_NAME: "The Page Object name was edited",
    EDITED: "The locator was edited",
    RERUN: "The locator generation was rerun",
    RERUN_GROUP: `The generation of ${value} locators was rerun`,
    REMOVE_PO: "The Page Object was deleted",
    REMOVE_EMPTY: "Empty page objects were deleted",
    REMOVE_ALL: "Page Objects were deleted",
    RESTORE: "The locator was restored",
    RESTORE_GROUP: `${value} locators were restored`,
    STOP_GENERATION: "The locator generation was stopped",
    STOP_GENERATION_GROUP: `The generation of ${value} locators was stopped`,
  };
};
