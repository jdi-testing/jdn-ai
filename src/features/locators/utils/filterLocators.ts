import { get } from 'lodash';
import { ILocator } from '../types/locator.types';
import { ClassFilterValue } from '../../filter/types/filter.types';
import { areAllValuesFalse } from './helpers';

export const filterLocatorsByClassFilter = (locators: ILocator[], filter: ClassFilterValue) => {
  if (!filter || areAllValuesFalse(filter)) return locators;

  const filteredLocators = locators?.filter((locator) => {
    const filterValue = filter;
    return Object.hasOwn(filterValue, locator.type) ? get(filterValue, locator.type) : true;
  });

  return filteredLocators;
};
