export const MAX_LOCATOR_NAME_LENGTH = 60;

export enum PageObjValidationErrorType {
  DuplicatedPageObjName = "This name already exists.", //err
  InvalidJavaClass = "This is not a valid Java class name.", ///err
  LongName = "Max name length is 60 characters.", //err
  EmptyValue = "Please fill out this field.", //err
}
