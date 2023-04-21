import {
  Locator,
  LocatorValidationErrors,
  LocatorValidationErrorType,
  LocatorValidationWarnings,
  JDNHash,
  ElementId,
} from "../types/locator.types";
import { equalHashes, evaluateXpath } from "./utils";

export const validateXpath = (
  xPathValue: string,
  jdnHash: JDNHash,
  locators: Locator[],
  element_id: ElementId,
  isCreatingForm?: boolean
): Promise<LocatorValidationErrorType | string> => {
  if (!xPathValue || !xPathValue.length) return Promise.resolve(LocatorValidationWarnings.EmptyValue);

  return evaluateXpath(xPathValue, element_id).then((result): LocatorValidationErrorType | string => {
    let length;
    let foundHash;
    let _element_id: ElementId;

    if (result !== LocatorValidationWarnings.NotFound) {
      length = JSON.parse(result).length;
      foundHash = JSON.parse(result).foundHash;
      _element_id = JSON.parse(result).element_id || element_id;
    }

    if (result === LocatorValidationWarnings.NotFound || length === 0) {
      return LocatorValidationWarnings.NotFound; //validationStatus: WARNING
    } else if (length > 1) {
      const err = `${length} ${LocatorValidationErrors.MultipleElements}` as LocatorValidationErrorType; //validationStatus: ERROR;
      throw new Error(err);
    } else if (length === 1) {
      const duplicates = equalHashes(foundHash, locators).filter((locator) => locator.element_id !== _element_id);
      if (foundHash && duplicates.length) {
        throw new Error(LocatorValidationErrors.DuplicatedLocator); //validationStatus: ERROR
      } else {
        const msg = isCreatingForm
          ? "" //validationStatus: SUCCESS
          : LocatorValidationWarnings.NewElement; //validationStatus: WARNING
        return msg;
      }
    }
    return "";
  });
};
