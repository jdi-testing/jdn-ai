import { Rule, RuleObject } from "antd/lib/form";
import { isStringMatchesReservedWord } from "../../pageObjects/utils/pageObject";
import { LocatorValidationErrors, LocatorValidationWarnings } from "../types/locator.types";
import { isValidJavaVariable } from "./utils";

export const createNameValidationRules = (isNameUnique: (value: string) => boolean): Rule[] => {
  return [
    {
      required: true,
      message: LocatorValidationWarnings.EmptyValue,
    },
    () => ({
      validator(_: RuleObject, value: string) {
        if (!value.length) return Promise.resolve();
        if (
          !isValidJavaVariable(value) ||
          isStringMatchesReservedWord(value)
          // || isStringMatchesReservedWordPerfTest(value) TODO: uncomment with validation rework, see issue #1176
        ) {
          return Promise.reject(new Error(LocatorValidationErrors.InvalidName));
        } else if (isNameUnique(value)) {
          return Promise.reject(new Error(LocatorValidationErrors.DuplicatedName));
        } else return Promise.resolve();
      },
    }),
  ];
};
