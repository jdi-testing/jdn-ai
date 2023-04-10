import {
  Locator,
  LocatorValidationErrors,
  LocatorValidationErrorType,
  LocatorValidationWarnings,
  JDNHash,
} from "../types/locator.types";
import { equalHashes, evaluateXpath } from "./utils";

export const validateXpath = (
  xPathValue: string,
  jdnHash: JDNHash,
  locators: Locator[],
  isCreatingForm?: boolean
): Promise<LocatorValidationErrorType | string> => {
  if (!xPathValue || !xPathValue.length) return Promise.resolve(LocatorValidationWarnings.EmptyValue);

  return evaluateXpath(xPathValue, jdnHash).then((result): LocatorValidationErrorType | string => {
    let length;
    let foundHash;
    let _jdnHash;

    if (result !== LocatorValidationWarnings.NotFound) {
      length = JSON.parse(result).length;
      foundHash = JSON.parse(result).foundHash;
      _jdnHash = JSON.parse(result).originJdnHash || jdnHash;
    }

    if (result === LocatorValidationWarnings.NotFound || length === 0) {
      return LocatorValidationWarnings.NotFound; //validationStatus: WARNING
    } else if (length > 1) {
      const err = `${length} ${LocatorValidationErrors.MultipleElements}` as LocatorValidationErrorType; //validationStatus: ERROR;
      throw new Error(err);
    } else if (length === 1) {
      if (foundHash !== _jdnHash) {
        if (equalHashes(foundHash, locators).length) {
          throw new Error(LocatorValidationErrors.DuplicatedLocator); //validationStatus: ERROR
        } else {
          //check condition during implementing 1147
          const msg = isCreatingForm
            ? "" //validationStatus: SUCCESS
            : LocatorValidationWarnings.NewElement; //validationStatus: WARNING
          return msg;
        }
      }
    }
    return "";
  });
};
