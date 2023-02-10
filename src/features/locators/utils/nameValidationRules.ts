import { Rule, RuleObject } from "antd/lib/form";
import { isStringMatchesReservedWord } from "../../pageObjects/utils/pageObject";
import { ValidationErrorType } from "../types/locator.types";
import { isValidJavaVariable } from "./utils";

export const createNameValidationRules = (isNameUnique: (value: string) => boolean): Rule[] => {
  return [
    {
      required: true,
      message: ValidationErrorType.EmptyValue,
    },
    () => ({
      validator(_: RuleObject, value: string) {
        if (!value.length) return Promise.resolve();
        if (!isValidJavaVariable(value) || isStringMatchesReservedWord(value)) {
          return Promise.reject(new Error(ValidationErrorType.InvalidName));
        } else if (isNameUnique(value)) {
          return Promise.reject(new Error(ValidationErrorType.DuplicatedName));
        } else return Promise.resolve();
      },
    }),
  ];
};
