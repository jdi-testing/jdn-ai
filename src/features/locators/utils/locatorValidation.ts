import {
  Locator,
  LocatorValidationErrors,
  LocatorValidationErrorType,
  LocatorValidationWarnings,
  JDNHash,
  ElementId,
} from "../types/locator.types";
import { checkDuplicates } from "./utils";

export const validateLocator = (
  locatorValue: string,
  jdnHash: JDNHash,
  locators: Locator[],
  element_id: ElementId,
  isCreatingForm?: boolean
): LocatorValidationErrorType | string => {
  let length;
  let foundHash;
  let _element_id: ElementId;
  let _jdnHash;
  let validationMessage = "";

  if (locatorValue === LocatorValidationWarnings.NotFound || !locatorValue) {
    validationMessage = LocatorValidationWarnings.NotFound; //validationStatus: WARNING
  } else {
    ({ length, foundHash } = JSON.parse(locatorValue));
    _element_id = JSON.parse(locatorValue).element_id || element_id;
    _jdnHash = JSON.parse(locatorValue).originJdnHash || jdnHash;
    if (length === 0) {
      validationMessage = LocatorValidationWarnings.NotFound; //validationStatus: WARNING
    } else if (length > 1) {
      const err = `${length} ${LocatorValidationErrors.MultipleElements}` as LocatorValidationErrorType; //validationStatus: ERROR;
      throw new Error(err);
    } else if (length === 1 && _jdnHash !== foundHash) {
      const duplicates = checkDuplicates(foundHash, locators, _element_id);
      if (foundHash && duplicates.length) {
        throw new Error(LocatorValidationErrors.DuplicatedLocator); //validationStatus: ERROR
      } else {
        validationMessage =
          isCreatingForm || !_jdnHash
            ? "" //validationStatus: SUCCESS
            : LocatorValidationWarnings.NewElement; //validationStatus: WARNING
      }
    }
  }

  return validationMessage;
};
