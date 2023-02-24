import { compact, uniq } from "lodash";
import {
  ElementLabel,
  ElementLibrary,
  ElementClass,
  libraryClasses,
  defaultClass,
} from "../types/generationClasses.types";

export const getJDILabel = (label: keyof ElementLabel, library: ElementLibrary): ElementClass =>
  libraryClasses[library][label] || defaultClass;

export const getJdiClassName = (label: keyof ElementLabel, library: ElementLibrary) => {
  let jdiClass = getJDILabel(label, library);
  if (jdiClass === defaultClass) jdiClass += ` (${label})`;
  return jdiClass ? jdiClass : label;
};

export const getTypesMenuOptions = (library: ElementLibrary) =>
  compact(
    uniq(
      Object.values(libraryClasses[library])
        .map((value) => {
          if (value !== defaultClass) return value;
          else return undefined;
        })
        .sort()
    )
  );
