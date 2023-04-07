import { Rule, RuleObject } from "antd/lib/form";
import { validateXpath } from "./locatorValidation";
import { Locator, LocatorValidationErrorType } from "../types/locator.types";

export const createLocatorValidationRules = (
  isCreatingForm: boolean,
  setValidationMessage: React.Dispatch<React.SetStateAction<LocatorValidationErrorType>>,
  locators: Locator[],
  jdnHash: string
): Rule[] => {
  return [
    () => ({
      validator(_: RuleObject, value: string) {
        return validateXpath(value, jdnHash, locators, isCreatingForm).then((result) =>
          setValidationMessage(result as LocatorValidationErrorType)
        );
      },
    }),
  ];
};
