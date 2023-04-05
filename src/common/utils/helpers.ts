import { cloneDeep } from "lodash";
import { Locator, LocatorValue, ValidationErrorType } from "../../features/locators/types/locator.types";
import { ElementLibrary, ElementClass } from "../../features/locators/types/generationClasses.types";
import { sendMessage } from "../../pageServices/connector";

export const floatToPercent = (value: number) => {
  // wse need to show percents, but multiply float * 100 provides an unexpected result and leads to bugs
  return Math.trunc(value * 100);
};

export const copyToClipboard = (text: string) => {
  const transformedText = text.replace(/'/g, "\\'").replace(/\n/g, "\\n");
  chrome.devtools.inspectedWindow.eval(`copy('${transformedText}')`);
};

export const getLocatorString = (locator: LocatorValue, type: ElementLibrary | ElementClass, name: string): string =>
  `@UI("${locator.output}")\npublic ${type} ${name};`;

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

export const isErrorValidationType = (type: string) => ValidationErrorType.hasOwnProperty(type);

export const isMacPlatform = (param: Window) => param.navigator?.userAgent.indexOf("Mac") != -1;

export const generateId = (): string => {
  return (
    Math.random().toString().substring(2, 12) +
    Date.now().toString().substring(5) +
    Math.random().toString().substring(2, 12)
  );
};

export const getElementFullXpath = async(foundElement: string): Promise<string> => {
  let fullXpath = "";
  const parser = new DOMParser();
  const parsedElement = parser.parseFromString(foundElement, "text/html").body.firstChild;

  await sendMessage
    .getElementXpath(parsedElement as Element)
    .then((xPath: string) => {
      if (xPath) fullXpath = xPath;
    })
    .catch((err: Error) => err);

  return fullXpath;
};

export const isFilteredSelect = (input: string, option: any) =>
  (option?.value?.toString() ?? "").toLowerCase().includes(input.toLowerCase());
