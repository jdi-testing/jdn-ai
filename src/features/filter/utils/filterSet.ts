import {
  defaultClass,
  ElementClass,
  ElementLibrary,
  libraryClasses,
} from "../../locators/types/generationClasses.types";
import { ClassFilterValue } from "../types/filter.types";
import { toLower } from "lodash";
import { defaultFilter } from "./defaultFilters";

export const jdiClassFilterInit = (library: ElementLibrary) => ({
  ...mapJDIclassesToFilter(library),
  [defaultClass]: true,
});

export const mapJDIclassesToFilter = (library: ElementLibrary): Record<ElementClass, boolean> => {
  return Object.entries(libraryClasses[library]).reduce((acc: Record<ElementClass, boolean>, entry) => {
    const [, value] = entry as [string, ElementClass];
    const _defaultFilter = defaultFilter[library];

    if (_defaultFilter) acc[value as ElementClass] = _defaultFilter.includes(value);
    else acc[value as ElementClass] = true;

    return acc;
  }, {} as Record<ElementClass, boolean>);
};

export const convertFilterToArr = (classFilter: ClassFilterValue, searchTerm: string) =>
  searchTerm === ""
    ? Object.entries(classFilter)
    : Object.entries(classFilter).filter(([key]) => toLower(key).includes(toLower(searchTerm)));
