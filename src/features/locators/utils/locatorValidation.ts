import { LocatorType } from '../../../common/types/common';
import { CustomError } from '../../../common/utils/customError';
import {
  ElementId,
  ILocator,
  JDNHash,
  LocatorValidationErrors,
  LocatorValidationErrorType,
  LocatorValidationWarnings,
} from '../types/locator.types';
import { checkDuplicates, evaluateLocator } from './utils';

// ToDo: logic refactoring needed
export const validateLocator = async (
  locatorString: string,
  locatorType: LocatorType,
  jdnHash: JDNHash,
  locators: ILocator[],
  element_id: ElementId,
  isCreatingForm?: boolean,
): Promise<LocatorValidationErrorType> => {
  let length;
  let foundHash;
  let validatedElementId: ElementId;
  let validatedJdnHash;
  let validationMessage: LocatorValidationErrorType = '';

  const locatorValue = await evaluateLocator(locatorString, locatorType, element_id, jdnHash);
  if (locatorValue === LocatorValidationWarnings.StartsWithDigit) {
    validationMessage = LocatorValidationWarnings.StartsWithDigit;
  } else if (locatorValue === LocatorValidationWarnings.NotFound || !locatorValue) {
    validationMessage = LocatorValidationWarnings.NotFound; //validationStatus: WARNING
  } else {
    ({ length, foundHash } = JSON.parse(locatorValue));
    validatedElementId = JSON.parse(locatorValue).element_id || element_id;
    validatedJdnHash = JSON.parse(locatorValue).originJdnHash || jdnHash;

    if (length === 0) {
      validationMessage = LocatorValidationWarnings.NotFound; //validationStatus: WARNING
    } else if (length > 1) {
      const err = `${length} ${LocatorValidationErrors.MultipleElements}` as LocatorValidationErrorType; //validationStatus: ERROR;
      throw new Error(err);
    } else if (length === 1 && validatedJdnHash !== foundHash) {
      const duplicates = checkDuplicates(foundHash, locators, validatedElementId);

      if (foundHash && duplicates.length) {
        throw new CustomError(LocatorValidationErrors.DuplicatedLocator, { duplicates }); //validationStatus: ERROR
      } else {
        validationMessage =
          isCreatingForm || !validatedJdnHash
            ? '' //validationStatus: SUCCESS
            : LocatorValidationWarnings.NewElement; //validationStatus: WARNING
      }
    }
  }

  return validationMessage;
};
