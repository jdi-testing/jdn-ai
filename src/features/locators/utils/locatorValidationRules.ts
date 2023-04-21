import { Rule, RuleObject } from "antd/lib/form";
import { validateXpath } from "./locatorValidation";
import { ElementId, Locator, LocatorValidationErrorType } from "../types/locator.types";

export const createLocatorValidationRules = (
  isCreatingForm: boolean,
  setValidationMessage: React.Dispatch<React.SetStateAction<LocatorValidationErrorType>>,
  locators: Locator[],
  jdnHash: string,
  element_id: ElementId
): Rule[] => {
  return [
    () => ({
      validator(_: RuleObject, value: string) {
        return validateXpath(value, jdnHash, locators, element_id, isCreatingForm)
          .then((result) => setValidationMessage(result as LocatorValidationErrorType))
          .catch((err) => {
            setValidationMessage(err.message);
            return Promise.reject(err);
          });
      },
    }),
  ];
};
