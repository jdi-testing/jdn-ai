import { ElementClass, ElementLibrary, libraryClasses } from "../../locators/types/generationClassesMap";

export const jdiClassFilterInit = (library: ElementLibrary) => mapJDIclassesToFilter(library);

export const mapJDIclassesToFilter = (library: ElementLibrary) => {
  return Object.entries(libraryClasses[library]).reduce((acc: Record<ElementClass, boolean>, entry) => {
    const [, value] = entry;
    acc[value as ElementClass] = true;
    return acc;
  }, {} as Record<ElementClass, boolean>);
};
