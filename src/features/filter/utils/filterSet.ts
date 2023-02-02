import { defaultClass, ElementClass, ElementLibrary, libraryClasses } from "../../locators/types/generationClassesMap";
import { ClassFilterValue } from "../types/filter.types";
import { toLower } from "lodash";

export const jdiClassFilterInit = (library: ElementLibrary) => ({...mapJDIclassesToFilter(library), [defaultClass]: true});

export const mapJDIclassesToFilter = (library: ElementLibrary) => {
  return Object.entries(libraryClasses[library]).reduce((acc: Record<ElementClass, boolean>, entry) => {
    const [, value] = entry;
    acc[value as ElementClass] = true;
    return acc;
  }, {} as Record<ElementClass, boolean>);
};

export const convertFilterToArr = (classFilter: ClassFilterValue, searchTerm: string) =>
  searchTerm === ""
    ? Object.entries(classFilter)
    : Object.entries(classFilter).filter(([key]) => toLower(key).includes(toLower(searchTerm)));
