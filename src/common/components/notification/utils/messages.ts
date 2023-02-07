export const messages = (value?: string) => {
  return {
    EDITED: "The locator was edited",
    RERUN: "The locator generation rerun",
    RERUN_GROUP: `The generation of ${value} locators was rerun`,
    STOP_GENERATION: "The locator generation was stopped",
    STOP_GENERATION_GROUP: `The generation of ${value} locators was stopped`,
    DELETE: "The locator was deleted",
    DELETE_GROUP: `${value} locators were deleted`,
    RESTORE: "The locator was restored",
    RESTORE_GROUP: `${value} locators were restored`,
    REMOVE_PO: "The page object was deleted",
    REMOVE_EMPTY: "Empty page objects were deleted",
    REMOVE_ALL: "Page objects were deleted",
    EDIT_PO_NAME: "The page object name was edited",
    DOWNLOAD_FILE: "The Java file was downloaded",
    DOWNLOAD_TEMPLATE: "The archive with template was downloaded",
    ACTION_CANCELLED: "The action was cancelled",
  };
};
