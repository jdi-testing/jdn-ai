import { get } from 'lodash';
import { ILocator } from '../types/locator.types';
import { ClassFilterValue } from '../../filter/types/filter.types';

export const filterLocatorsByClassFilter = (locators: ILocator[], filter: ClassFilterValue) => {
  if (!filter) return locators;
  const _locators = locators?.filter((locator) => {
    const filterValue = filter;
    return Object.hasOwn(filterValue, locator.type) ? get(filterValue, locator.type) : true;
  });
  return _locators;
};
