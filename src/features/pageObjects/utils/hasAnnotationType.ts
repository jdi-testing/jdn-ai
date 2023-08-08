import { Locator } from "../../locators/types/locator.types";

export const hasAnnotationType = (objects: Locator[], annotationType: string): boolean => {
  return objects.some((obj) => obj.annotationType === annotationType);
};
