import React from 'react';
import { Rule, RuleObject } from 'antd/lib/form';
import { validateLocator } from './locatorValidation';
import { ElementId, ILocator, LocatorValidationErrorType, LocatorValidationWarnings } from '../types/locator.types';
import { LocatorType } from '../../../common/types/common';

export const createLocatorValidationRules = (
  isCreatingForm: boolean,
  locatorType: LocatorType,
  setValidationMessage: React.Dispatch<React.SetStateAction<LocatorValidationErrorType>>,
  setValidationErrorOptions: React.Dispatch<React.SetStateAction<any>>,
  locators: ILocator[],
  jdnHash: string,
  elementId: ElementId,
  notShownElementIds: string[],
): Rule[] => {
  return [
    {
      validator: async (_: RuleObject, locatorValue: string) => {
        if (!locatorValue.length) {
          setValidationMessage(LocatorValidationWarnings.EmptyValue); // validationStatus: WARNING
          return Promise.resolve();
        }
        try {
          const validationMessage = await validateLocator(
            locatorValue,
            locatorType,
            jdnHash,
            locators,
            elementId,
            notShownElementIds,
            isCreatingForm,
          );
          setValidationMessage(validationMessage as LocatorValidationErrorType);
          return await Promise.resolve();
        } catch (err) {
          console.error('another validation error');
          setValidationMessage(err.message as LocatorValidationErrorType);
          setValidationErrorOptions(err.options);
          return Promise.reject(err);
        }
      },
    },
  ];
};
