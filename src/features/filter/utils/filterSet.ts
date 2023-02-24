import {
  defaultClass,
  ElementClass,
  ElementLibrary,
  libraryClasses,
} from "../../locators/types/generationClasses.types";
import { ClassFilterValue } from "../types/filter.types";
import { toLower } from "lodash";
import { defaultFilterOn } from "./defaultFilter";

export const jdiClassFilterInit = (library: ElementLibrary) => ({
  ...mapJDIclassesToFilter(library),
  [defaultClass]: true,
});

export const mapJDIclassesToFilter = (library: ElementLibrary): Record<ElementClass, boolean> => {
  return Object.entries(libraryClasses[library]).reduce((acc: Record<ElementClass, boolean>, entry) => {
    const [, value] = entry as [string, ElementClass];
    acc[value as ElementClass] = defaultFilterOn.includes(value);
    return acc;
  }, {} as Record<ElementClass, boolean>);
};

export const convertFilterToArr = (classFilter: ClassFilterValue, searchTerm: string) =>
  searchTerm === ""
    ? Object.entries(classFilter)
    : Object.entries(classFilter).filter(([key]) => toLower(key).includes(toLower(searchTerm)));
