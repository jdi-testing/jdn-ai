import { Rule, RuleObject } from "antd/lib/form";
import {
  Locator,
  LocatorValidationErrors,
  LocatorValidationWarnings,
  LocatorValidationErrorType,
} from "../types/locator.types";
import { evaluateXpath, equalHashes } from "./utils";

export const createLocatorValidationRules = (
  isCreatingForm: boolean,
  setValidationMessage: React.Dispatch<React.SetStateAction<LocatorValidationErrorType>>,
  validationEnabled: boolean,
  locators: Locator[],
  jdnHash: string
): Rule[] => {
  return [
    () => ({
      validator(_: RuleObject, value: string) {
        if (!validationEnabled) {
          setValidationMessage(""); //validationStatus: WARNING
          return Promise.resolve();
        }
        if (!value.length) {
          setValidationMessage(LocatorValidationWarnings.EmptyValue); //validationStatus: WARNING
          return Promise.resolve();
        }
        return evaluateXpath(value).then((response): Promise<LocatorValidationErrorType | void> | void => {
          const result = response[0].result;
          let length;
          let foundHash;

          if (result !== LocatorValidationWarnings.NotFound) {
            length = JSON.parse(result).length;
            foundHash = JSON.parse(result).foundHash;
          }

          if (result === LocatorValidationWarnings.NotFound || length === 0) {
            setValidationMessage(LocatorValidationWarnings.NotFound); //validationStatus: WARNING
            return Promise.resolve();
          } else if (length > 1) {
            setValidationMessage(`${length} ${LocatorValidationErrors.MultipleElements}` as LocatorValidationErrorType); //validationStatus: ERROR;
            return Promise.reject(new Error());
          } else if (length === 1) {
            if (foundHash !== jdnHash) {
              if (equalHashes(foundHash, locators).length) {
                setValidationMessage(LocatorValidationErrors.DuplicatedLocator); //validationStatus: ERROR
                return Promise.reject(new Error());
              } else {
                //check condition during implementing 1147
                isCreatingForm
                  ? setValidationMessage("") //validationStatus: SUCCESS
                  : setValidationMessage(LocatorValidationWarnings.NewElement); //validationStatus: WARNING
                return Promise.resolve();
              }
            } else {
              setValidationMessage(""); //validationStatus: SUCCESS
              return Promise.resolve();
            }
          }
        });
      },
    }),
  ];
};
