import { saveAs } from "file-saver";
import { chain, isEmpty, size, subtract, toLower, toString, truncate, upperFirst } from "lodash";
import connector from "../../../pageServices/connector";
import { ElementId, Locator } from "../../locators/types/locator.types";
import { PageObject, PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementLabel, ElementLibrary } from "../../locators/types/generationClasses.types";
import javaReservedWords from "./javaReservedWords.json";
import perfReservedWords from "./perfReservedWords.json";
import { pageObjectTemplate } from "./pageObjectTemplate";
import { pageObjectTemplatePerfTest } from "./pageObjectTemplatePerfTest";
import { getJDILabel } from "../../locators/utils/locatorTypesUtils";
import { MAX_LOCATOR_NAME_LENGTH } from "./constants";

export const isStringMatchesReservedWord = (string: string) => javaReservedWords.includes(string);

export const isStringMatchesReservedWordPerfTest = (string: string) => perfReservedWords.includes(string);

export const isNameUnique = (elements: Array<Locator>, element_id: ElementId, newName: string) =>
  !elements.find((elem) => elem.name === newName && elem.element_id !== element_id);

export const isPONameUnique = (elements: Array<PageObject>, id: PageObjectId, newName: string) =>
  !elements.find((elem) => toLower(elem.name) === toLower(newName) && elem.id !== id);

export const createElementName = (
  element: Locator,
  library: ElementLibrary,
  uniqueNames: Array<string>,
  newType?: string
) => {
  const { elemName, elemId, elemText, predicted_label, elemAriaLabel } = element;

  const uniqueIndex = (name: string) => {
    let index = 1;

    while (!isUnique(concat(name)(String(index)))) {
      index++;
    }

    return index;
  };

  const returnLatinCodePoints = (string: string) => string.replace(/[^\u0000-\u00ff]/gu, "");

  const normalizeString = (string: string) =>
    chain(string).trim().camelCase().truncate({ length: MAX_LOCATOR_NAME_LENGTH, omission: "" }).value();

  const isUnique = (_name: string) => uniqueNames.indexOf(_name) === -1;

  const concat = (origin: string) => (append: string) => {
    const _origin = origin;
    if (_origin)
      return truncate(_origin, { length: subtract(60, size(append)), omission: "" }).concat(upperFirst(append));
    else return append;
  };

  const getName = () => (elemName ? normalizeString(elemName) : "");
  const getText = () => (elemText ? normalizeString(returnLatinCodePoints(elemText)) : "");
  const getAriaLabel = () => (elemAriaLabel ? normalizeString(returnLatinCodePoints(elemAriaLabel)) : "");
  const getId = () => (elemId ? normalizeString(elemId) : "");
  const getClass = () => (newType || getJDILabel(predicted_label as keyof ElementLabel, library)).toLowerCase();
  const getIndex = (string: string) => toString(uniqueIndex(string));

  const pickingTerms = [getName, getText, getAriaLabel];
  const concatenatingTerms = [getId, getClass, getIndex];

  const startsWithNumber = new RegExp("^[0-9].*$");
  const checkNumberFirst = (string: string) => (string.match(startsWithNumber) ? `name${string}` : string);

  let _resultName = "";

  const pickValue = () => {
    let _baseName = "";
    let _result = "";

    let indexP = 0;
    do {
      const newTerm = pickingTerms[indexP]();
      if (!size(_baseName)) _baseName = newTerm;
      _result = newTerm;
      indexP++;
    } while (indexP !== pickingTerms.length && (!isUnique(_result) || isEmpty(_result)));

    if (!isUnique(_result) || isEmpty(_result)) {
      _result = _baseName;
    }

    return checkNumberFirst(_result);
  };

  _resultName = pickValue();

  let indexC = 0;
  while (!isUnique(_resultName) || isEmpty(_resultName)) {
    const _index = indexC < concatenatingTerms.length ? indexC : concatenatingTerms.length - 1;
    const newTerm = concatenatingTerms[_index](_resultName);
    _resultName = checkNumberFirst(concat(_resultName)(newTerm));
    indexC++;
  }

  return _resultName;
};

export const createLocatorNames = (elements: Array<Locator>, library: ElementLibrary) => {
  const f = elements.filter((el) => el && !el.deleted);
  const uniqueNames: Array<string> = [];

  return f.map((e) => {
    const name = createElementName(e, library, uniqueNames);
    uniqueNames.push(name);

    const type = getJDILabel(e.predicted_label as keyof ElementLabel, library);

    return {
      ...e,
      name,
      type,
    };
  });
};

export const getPageAttributes = async () => {
  return await connector.attachContentScript(() => {
    const { title, URL } = document;
    return { title, url: URL };
  });
};

export const getPage = async (
  locators: Array<Locator>,
  pageObject: PageObject
): Promise<{ pageCode: string; title: string }> => {
  return pageObjectTemplate(locators, pageObject);
};

export const getPagePerfTest = async (
  locators: Array<Locator>,
  pageObject: PageObject
): Promise<{ pageCode: string; name: string }> => {
  return pageObjectTemplatePerfTest(locators, pageObject);
};

export const generatePageObject = async (elements: Array<Locator>, pageObject: PageObject): Promise<void> => {
  const page = await getPage(elements, pageObject);
  const blob = new Blob([page.pageCode], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${page.title}.java`);
};

export const generatePageObjectPerfTest = async (elements: Array<Locator>, pageObject: PageObject): Promise<void> => {
  const page = await getPagePerfTest(elements, pageObject);
  const blob = new Blob([page.pageCode], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${page.name}.js`);
};
