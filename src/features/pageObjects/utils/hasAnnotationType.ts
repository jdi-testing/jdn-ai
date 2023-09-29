import { ILocator } from '../../locators/types/locator.types';

export const hasAnnotationType = (objects: ILocator[], annotationType: string): boolean => {
  return objects.some((obj) => obj.annotationType === annotationType);
};
