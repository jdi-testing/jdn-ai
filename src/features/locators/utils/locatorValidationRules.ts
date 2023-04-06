import { Rule, RuleObject } from "antd/lib/form";
import { Locator, ValidationErrorType } from "../types/locator.types";
import { validateXpath } from "./locatorValidation";
import { evaluateXpath, equalHashes } from "./utils";

export const createLocatorValidationRules = (
  setLocatorValidity: React.Dispatch<React.SetStateAction<string>>,
  validationEnabled: boolean,
  locators: Locator[],
  jdnHash: string
): Rule[] => {
  return [
    () => ({
      validator(_: RuleObject, value: string) {
        if (!validationEnabled) {
          setLocatorValidity("");
          return Promise.resolve();
        }

        return validateXpath(value, jdnHash, locators).then((result) => setLocatorValidity(result));

        // if (!value.length) {
        //   setLocatorValidity(ValidationErrorType.EmptyValue);
        //   return Promise.resolve();
        // }
        // return evaluateXpath(value).then((response) => {
        //   const result = response[0].result;
        //   let length;
        //   let foundHash;

        //   if (result !== ValidationErrorType.NotFound) {
        //     length = JSON.parse(result).length;
        //     foundHash = JSON.parse(result).foundHash;
        //   }

        //   if (result === ValidationErrorType.NotFound || length === 0) {
        //     setLocatorValidity(ValidationErrorType.NotFound);
        //   } else if (length > 1) {
        //     setLocatorValidity(ValidationErrorType.MultipleElements);
        //   } else if (length === 1) {
        //     if (foundHash !== jdnHash) {
        //       if (equalHashes(foundHash, locators).length) setLocatorValidity(ValidationErrorType.DuplicatedLocator);
        //       else setLocatorValidity(ValidationErrorType.NewElement);
        //     } else {
        //       setLocatorValidity("");
        //     }
        //   }
        // });
      },
    }),
  ];
};
