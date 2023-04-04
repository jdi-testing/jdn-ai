import { Rule, RuleObject } from "antd/lib/form";
import { Locator, ValidationErrorType, ValidationStatus, Validity } from "../types/locator.types";
import { evaluateXpath, equalHashes } from "./utils";

export const createLocatorValidationRules = (
  isCreatingForm: boolean,
  setLocatorValidity: React.Dispatch<React.SetStateAction<Validity>>,
  validationEnabled: boolean,
  locators: Locator[],
  jdnHash: string
): Rule[] => {
  return [
    () => ({
      validator(_: RuleObject, value: string) {
        if (!validationEnabled) {
          setLocatorValidity({ message: "", validationStatus: ValidationStatus.WARNING });
          return Promise.resolve();
        }
        if (!value.length) {
          setLocatorValidity({ message: ValidationErrorType.EmptyValue, validationStatus: ValidationStatus.WARNING });
          return Promise.resolve();
        }
        return evaluateXpath(value).then((response): Promise<ValidationErrorType | void> | void => {
          const result = response[0].result;
          let length;
          let foundHash;

          if (result !== ValidationErrorType.NotFound) {
            length = JSON.parse(result).length;
            foundHash = JSON.parse(result).foundHash;
          }

          if (result === ValidationErrorType.NotFound || length === 0) {
            setLocatorValidity({ message: ValidationErrorType.NotFound, validationStatus: ValidationStatus.WARNING });
            return Promise.resolve();
          } else if (length > 1) {
            setLocatorValidity({
              message: `${length} ${ValidationErrorType.MultipleElements}` as ValidationErrorType,
              validationStatus: ValidationStatus.ERROR,
            });
            return Promise.reject(new Error());
          } else if (length === 1) {
            if (foundHash !== jdnHash) {
              if (equalHashes(foundHash, locators).length) {
                setLocatorValidity({
                  message: ValidationErrorType.DuplicatedLocator,
                  validationStatus: ValidationStatus.ERROR,
                });
                return Promise.reject(new Error());
              } else {
                //check condition during implementing 1147
                isCreatingForm
                  ? setLocatorValidity({ message: "", validationStatus: ValidationStatus.SUCCESS })
                  : setLocatorValidity({
                      message: ValidationErrorType.NewElement,
                      validationStatus: ValidationStatus.WARNING,
                    });
                return Promise.resolve();
              }
            } else {
              setLocatorValidity({ message: "", validationStatus: ValidationStatus.SUCCESS });
              return Promise.resolve();
            }
          }
        });
      },
    }),
  ];
};
