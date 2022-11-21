import { cloneDeep } from "lodash";
import { getLocator } from "../../features/locators/locator/utils";
import { Locator, LocatorValue } from "../../features/locators/locatorSlice.types";
import { ElementLibrary } from "../../features/pageObjects/utils/generationClassesMap";
import { VALIDATION_ERROR_TYPE } from "../constants/constants";

export const floatToPercent = (value: number) => {
  // wse need to show percents, but multiply float * 100 provides an unexpected result and leads to bugs
  return Math.trunc(value * 100);
};

export const copyToClipboard = (text: string) => {
  const transformedText = text.replace(/'/g, "\\'").replace(/\n/g, "\\n");
  chrome.devtools.inspectedWindow.eval(`copy('${transformedText}')`);
};

export const getLocatorString = (locator: LocatorValue, type: ElementLibrary, name: string) =>
  `@UI("${getLocator(locator)}")\npublic ${type} ${name};`;

export const convertToListWithChildren = (_list: Array<Locator>) => {
  const list = cloneDeep(_list);
  const map: Record<string, number> = {};

  for (let i = 0; i < list.length; i++) {
    map[list[i].jdnHash] = i;
    list[i].children = [];
  }

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.parent_id !== "") {
      const children = list[map[node.parent_id]]?.children;
      children && children.push(node.element_id);
    }
  }

  return list;
};

export const isErrorValidationType = (type: string) => VALIDATION_ERROR_TYPE.hasOwnProperty(type);
