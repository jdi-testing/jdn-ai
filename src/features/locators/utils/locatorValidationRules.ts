import { Rule, RuleObject } from "antd/lib/form";
import { Locator } from "../types/locator.types";
import { validateXpath } from "./locatorValidation";

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
      },
    }),
  ];
};
