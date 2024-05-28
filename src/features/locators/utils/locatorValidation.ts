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
  elementId: ElementId,
  notShownElementIds: string[],
  isCreatingForm?: boolean,
): Promise<LocatorValidationErrorType> => {
  let length;
  let foundHash;
  let validatedElementId: ElementId;
  let validatedJdnHash;
  let validationMessage: LocatorValidationErrorType = '';

  const locatorValue = await evaluateLocator(locatorString, locatorType, elementId, jdnHash);
  if (locatorValue === LocatorValidationWarnings.StartsWithDigit) {
    validationMessage = LocatorValidationWarnings.StartsWithDigit;
  } else if (locatorValue === LocatorValidationWarnings.NotFound || !locatorValue) {
    validationMessage = LocatorValidationWarnings.NotFound; //validationStatus: WARNING
  } else {
    ({ length, foundHash } = JSON.parse(locatorValue));
    validatedElementId = JSON.parse(locatorValue).elementId || elementId;
    validatedJdnHash = JSON.parse(locatorValue).originJdnHash || jdnHash;

    // TODO: remove hardcode, when for Selenium framework support is added to the project (issue/585)
    const isSelenium = false; // hardcode
    const duplicateErrorCondition = isSelenium ? length > 1 : length > 1 && !notShownElementIds.includes(foundHash);

    if (length === 0) {
      validationMessage = LocatorValidationWarnings.NotFound; //validationStatus: WARNING
    } else if (duplicateErrorCondition) {
      console.log('throw duplicate error');
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
