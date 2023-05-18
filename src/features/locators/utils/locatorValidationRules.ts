import { Rule, RuleObject } from "antd/lib/form";
import { validateLocator } from "./locatorValidation";
import { ElementId, Locator, LocatorValidationErrorType, LocatorValidationWarnings } from "../types/locator.types";
import { LocatorType } from "../../../common/types/common";
import { evaluateXpath, evaluateCssSelector } from "./utils";

export const createLocatorValidationRules = (
  isCreatingForm: boolean,
  locatorType: LocatorType,
  setValidationMessage: React.Dispatch<React.SetStateAction<LocatorValidationErrorType>>,
  locators: Locator[],
  jdnHash: string,
  element_id: ElementId
): Rule[] => {
  return [
    {
      validator: async (_: RuleObject, locatorValue: string) => {
        if (!locatorValue.length) {
          setValidationMessage(LocatorValidationWarnings.EmptyValue); // validationStatus: WARNING
          return Promise.resolve();
        }

        try {
          const evaluatedLocator =
            locatorType === LocatorType.cssSelector
              ? await evaluateCssSelector(locatorValue, element_id, jdnHash)
              : await evaluateXpath(locatorValue, element_id, jdnHash);
          const validationMessage = validateLocator(evaluatedLocator, jdnHash, locators, element_id, isCreatingForm);
          setValidationMessage(validationMessage as LocatorValidationErrorType);
          return Promise.resolve();
        } catch (err) {
          setValidationMessage(err.message as LocatorValidationErrorType);
          return Promise.reject(err);
        }
      },
    },
  ];
};
