import { get } from 'lodash';
import { ILocator } from '../types/locator.types';
import { ClassFilterValue } from '../../filter/types/filter.types';
import { areAllValuesFalse } from './helpers';

export const filterLocatorsByClassFilter = (locators: ILocator[], filter: ClassFilterValue) => {
  if (!filter || areAllValuesFalse(filter)) {
    return locators;
  }

  const filteredLocators = locators?.filter((locator) => {
    const filterValue = filter;
    const hasFilterValue = Object.hasOwn(filterValue, locator.type);
    const filterResult = get(filterValue, locator.type);
    return hasFilterValue ? filterResult : true;
  });

  if (filteredLocators === undefined) {
    console.error('filteredLocators is undefined');
  }

  return filteredLocators;
};
