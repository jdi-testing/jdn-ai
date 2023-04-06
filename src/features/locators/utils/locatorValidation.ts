import { Locator, ValidationErrorType } from "../types/locator.types";
import { equalHashes, evaluateXpath } from "./utils";

export const validateXpath = (
  xpathValue: string,
  jdnHash: string,
  locators: Locator[]
): Promise<ValidationErrorType | string> => {
  if (!xpathValue || !xpathValue.length) return Promise.resolve(ValidationErrorType.EmptyValue);

  return evaluateXpath(xpathValue, jdnHash).then((result) => {
    let length;
    let foundHash;
    let _jdnHash;

    if (result !== ValidationErrorType.NotFound) {
      length = JSON.parse(result).length;
      foundHash = JSON.parse(result).foundHash;
      _jdnHash = JSON.parse(result).originJdnHash || jdnHash;
    }

    if (result === ValidationErrorType.NotFound || length === 0) {
      return ValidationErrorType.NotFound;
    } else if (length > 1) {
      return ValidationErrorType.MultipleElements;
    } else if (length === 1) {
      if (foundHash !== _jdnHash) {
        if (equalHashes(foundHash, locators).length) return ValidationErrorType.DuplicatedLocator;
        else return ValidationErrorType.NewElement;
      }
    }
    return "";
  });
};
