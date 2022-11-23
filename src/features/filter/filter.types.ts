import { PageObjectId } from "../pageObjects/pageObjectSlice.types";
import { ElementClass } from "../pageObjects/utils/generationClassesMap";

export interface Filter extends FilterType {
  pageObjectId: PageObjectId;
}

export interface FilterType {
  [FilterKey.JDIclassFilter]: ClassFilterValue;
}

export type ClassFilterValue = Partial<Record<ElementClass, boolean>>;

export enum FilterKey {
  JDIclassFilter = "JDIclassFilter",
}

export interface JDIClassFilterValue {
  Checked: boolean;
  JDIclass: ElementClass;
}
