import { get } from 'lodash';
import { ILocator } from '../types/locator.types';
import { ClassFilterValue } from '../../filter/types/filter.types';

export const filterLocatorsByClassFilter = (locators: ILocator[], filter: ClassFilterValue) => {
  if (!filter) return locators;

  return locators?.filter((locator) => {
    return Object.hasOwn(filter, locator.type) ? get(filter, locator.type) : true;
  });
};
