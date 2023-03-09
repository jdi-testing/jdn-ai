import { saveAs } from "file-saver";
import JSZip from "jszip";
import {
  chain,
  entries,
  isEmpty,
  isNumber,
  join,
  lowerFirst,
  size,
  subtract,
  take,
  toLower,
  toString,
  upperFirst,
} from "lodash";

import { RootState } from "../../../app/store/store";
import { selectConfirmedLocators, selectPageObjects } from "../pageObject.selectors";
import { connector } from "../../../pageServices/connector";
import { ElementId, Locator } from "../../locators/types/locator.types";
import { PageObject } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementLabel, ElementLibrary } from "../../locators/types/generationClasses.types";
import javaReservedWords from "./javaReservedWords.json";
import { pageObjectTemplate } from "./pageObjectTemplate";
import { testFileTemplate } from "./testTemplate";
import { getJDILabel } from "../../locators/utils/locatorTypesUtils";

export const isStringMatchesReservedWord = (string: string) => javaReservedWords.includes(string);

export const isNameUnique = (elements: Array<Locator>, element_id: ElementId, newName: string) =>
  !elements.find((elem) => elem.name === newName && elem.element_id !== element_id);

export const isPONameUnique = (elements: Array<PageObject>, id: ElementId, newName: string) =>
  !elements.find((elem) => toLower(elem.name) === toLower(newName) && elem.id !== id);

export const createElementName = (
  element: Locator,
  library: ElementLibrary,
  uniqueNames: Array<string>,
  newType?: string
) => {
  const { elemName, elemId, elemText, predicted_label } = element;

  const uniqueIndex = (name: string) => {
    let index = 1;

    while (!isUnique(name.concat(toString(index)))) {
      index++;
    }

    return index;
  };

  const returnLatinCodepoints = (string: string) => (/[^\u0000-\u00ff]/.test(string) ? "" : string);

  const normalizeString = (string: string) => chain(string).trim().camelCase().value();

  const isUnique = (_name: string) => uniqueNames.indexOf(_name) === -1;

  const getName = () => (elemName ? normalizeString(elemName) : "");
  const getId = () => (elemId ? normalizeString(elemId) : "");
  const getText = (string: string) =>
    elemText ? join(take(normalizeString(returnLatinCodepoints(elemText)), subtract(60, size(string))), "") : "";
  const getClass = () => (newType || getJDILabel(predicted_label as keyof ElementLabel, library)).toLowerCase();
  const getIndex = (string: string) => toString(uniqueIndex(string));
  const startsWithNumber = new RegExp("^[0-9].*$");
  const checkNumberFirst = (string: string) => (string.match(startsWithNumber) ? `name${string}` : string);

  let _resultName = "";
  let index = 0;

  const terms = [getName, getId, getText, getClass, getIndex];

  do {
    const newTerm = terms[index](_resultName);
    _resultName = checkNumberFirst(_resultName.concat(size(_resultName) ? upperFirst(newTerm) : newTerm));
    index++;
  } while (!isUnique(_resultName) || isEmpty(_resultName));

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

export const getPage = async (locators: Array<Locator>, title: string, libraries: Array<ElementLibrary>) => {
  const pageObject = pageObjectTemplate(locators, title, libraries);
  return pageObject;
};

export const generatePageObject = async (elements: Array<Locator>, title: string, library: ElementLibrary) => {
  const page = await getPage(elements, title, [library]);
  const blob = new Blob([page.pageCode], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${page.title}.java`);
};

export const generateAndDownloadZip = async (state: RootState, template: Blob) => {
  const pageObjects = selectPageObjects(state);

  const zip = await JSZip.loadAsync(template, { createFolders: true });
  const rootFolder = entries(zip.files)[0][0];

  const newZip = new JSZip();

  // remove root folder by changing files path
  const filePromises: Array<Promise<JSZip.JSZipObject | void>> = [];
  (zip.folder(rootFolder) || []).forEach(async (relativePath, file) => {
    if (isNumber(file) || file.dir) return;

    filePromises.push(
      file.async("string").then((content) => {
        newZip.file(relativePath, content, { binary: true });
      })
    );
  });

  Promise.all(filePromises).then(async () => {
    const saveZip = async () => {
      const blob = await newZip.generateAsync({ type: "blob" });
      saveAs(blob, `${rootFolder.replace("/", "")}.zip`);
    };

    for (const po of pageObjects) {
      // create page object files
      const locators = selectConfirmedLocators(state, po.id);
      if (!size(locators)) continue;
      const page = await getPage(locators, po.name, [po.library]);

      let instanceName = lowerFirst(po.name);

      await newZip.file(`src/main/java/site/pages/${page.title}.java`, page.pageCode, { binary: false });

      await newZip
        .file("src/test/resources/test.properties")!
        .async("string")
        .then(function success(content) {
          const testDomain = po.origin;
          const newContent = content.replace("${domain}", `${testDomain}`);
          return newZip.file(`src/test/resources/test.properties`, newContent, { binary: true });
        });

      await newZip
        .file("src/main/java/site/MySite.java")!
        .async("string")
        .then((content) => {
          if (content.includes(instanceName)) instanceName = `${instanceName}1`;
          const urlSearchParams = po.search;
          const testUrl = urlSearchParams.length ? po.pathname + urlSearchParams : po.pathname;
          const newContent = content.replace(
            "// ADD SITE PAGES WITH URLS",
            `// ADD SITE PAGES WITH URLS\n    @Url("${testUrl}")\n    public static ${po.name} ${instanceName};
                `
          );
          return newZip.file(`src/main/java/site/MySite.java`, newContent, { binary: true });
        });

      await newZip.file(`src/test/java/tests/${po.name}Tests.java`, testFileTemplate(instanceName, po.name));
    }

    saveZip();
  });
};
