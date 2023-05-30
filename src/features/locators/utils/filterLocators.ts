import { get } from "lodash";
import { Locator } from "../types/locator.types";
import { ClassFilterValue } from "../../filter/types/filter.types";

export const filterLocatorsByClassFilter = (locators: Locator[], filter: ClassFilterValue) => {
  if (!filter) return locators;
  const _locators = locators?.filter((loc) => {
    const filterValue = filter;
    return Object.hasOwn(filterValue, loc.type) ? get(filterValue, loc.type) : true;
  });
  return _locators;
};
