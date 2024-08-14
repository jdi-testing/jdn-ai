import { defaultClass, ElementLibrary, libraryClasses } from '../../locators/types/generationClasses.types';
import { ClassFilterValue } from '../types/filter.types';
import { toLower } from 'lodash';

export const mapJDIclassesToFilter = (
  library: ElementLibrary,
  defaultFilterKeys: string[] = [],
): Record<string, boolean> => {
  const JDIclass = libraryClasses[library];

  const filter: Record<string, boolean> = {};

  Object.values(JDIclass).forEach((key) => {
    filter[key] = false;
  });

  defaultFilterKeys.forEach((key) => {
    if (filter.hasOwnProperty(key)) {
      filter[key] = true;
    }
  });

  return filter;
};

export const jdiClassFilterInit = (library: ElementLibrary) => {
  const mappedClasses = mapJDIclassesToFilter(library);

  return {
    ...mappedClasses,
    [defaultClass]: false,
  };
};

export const convertFilterToArr = (classFilter: ClassFilterValue, searchTerm: string) =>
  searchTerm === ''
    ? Object.entries(classFilter)
    : Object.entries(classFilter).filter(([key]) => toLower(key).includes(toLower(searchTerm)));
